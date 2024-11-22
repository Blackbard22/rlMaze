import json
import time
from django.http import StreamingHttpResponse, JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from ..models import Maze   
import numpy as np
import random
from huey.contrib.djhuey import task
from ..models import TaskStatus
from django.core.cache import cache



agent_current_position = [0, 6]

def update_agent_position(position):
    global agent_current_position
    agent_current_position = [position[0], position[1]]

def get_position(position):
    cache.set('agent_position', position, timeout=None)


@task()
def sarsa_logic(episodes, time_value, epsilon, epsilon_decay, learning_rate, task_id):
    maze_object = Maze.objects.first()
    maze = json.loads(maze_object.layout)

    agent = train_sarsa(maze, episodes=episodes, epsilon=epsilon, epsilon_decay=epsilon_decay, learning_rate=learning_rate, task_id=task_id)  
    
    solution_path = solve_maze(maze, agent, task_id)  

    cache.set('solution_path', solution_path, timeout=None)

    return {
        'solution_path': solution_path,
        'algo': 'sarsa',
        'time': time_value,
        'status': 'completed'
    }


class MazeEnvironment:
    def __init__(self, maze):
        self.maze = maze
        self.start = self.find_position('S')
        self.goal = self.find_position('G')
        self.current_state = self.start

    def find_position(self, char):
        return next((i, j) for i, row in enumerate(self.maze) for j, c in enumerate(row) if c == char)

    def reset(self):
        self.current_state = self.start
        return self.current_state

    def step(self, action):
        moves = [(-1, 0), (0, 1), (1, 0), (0, -1)]
        new_state = (self.current_state[0] + moves[action][0], 
                     self.current_state[1] + moves[action][1])

        if self.is_valid_move(new_state):
            self.current_state = new_state
            if self.current_state == self.goal:
                return new_state, 1, True  # Reached goal
            return new_state, -0.01, False  # Small negative reward for each step
        return self.current_state, -1, False  # Hit a wall

    def is_valid_move(self, state):
        return (0 <= state[0] < len(self.maze) and
                0 <= state[1] < len(self.maze[0]) and
                self.maze[state[0]][state[1]] != '#')

class SARSAAgent:
    def __init__(self, state_size, action_size, learning_rate=0.1, discount_factor=0.95, epsilon=1.0, epsilon_decay=0.995, epsilon_min=0.01):
        self.state_size = state_size
        self.action_size = action_size
        self.q_table = np.zeros((state_size[0], state_size[1], action_size))
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min

    def get_action(self, state):
        if random.uniform(0, 1) < self.epsilon:
            return random.randint(0, self.action_size - 1)  # Explore
        return np.argmax(self.q_table[state])  # Exploit

    def update_q_table(self, state, action, reward, next_state, next_action):
        current_q = self.q_table[state][action]
        next_q = self.q_table[next_state][next_action]
        new_q = current_q + self.lr * (reward + self.gamma * next_q - current_q)
        self.q_table[state][action] = new_q

    def decay_epsilon(self):
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)








def train_sarsa(maze, episodes=8, epsilon=1.0, epsilon_decay=0.995, learning_rate=0.1, task_id=None):
    env = MazeEnvironment(maze)
    state_size = (len(maze), len(maze[0]))
    action_size = 4  # up, right, down, left

    agent = SARSAAgent(state_size, action_size, learning_rate=learning_rate, epsilon=epsilon, epsilon_decay=epsilon_decay)

    print(f"task id is received: {task_id}")

    for episode in range(episodes):
        # Check if the task should be cancelled
        try:
            task_status = TaskStatus.objects.get(task_id=task_id)
            if task_status.status == 'cancelled':
                print(f'Task {task_id} cancelled')
                return None
        except TaskStatus.DoesNotExist:
            pass  # Task not cancelled, continue execution

        state = env.reset()
        action = agent.get_action(state)
        done = False
        step = 0

        while not done:
            try:
                task_status = TaskStatus.objects.get(task_id=task_id)
                if task_status.status == 'cancelled':
                    print(f'Task {task_id} cancelled')
                    return None
            except TaskStatus.DoesNotExist:
                pass  # Task not cancelled, continue execution

            display_maze(maze, state, episode, step)
            next_state, reward, done = env.step(action)
            next_action = agent.get_action(next_state)

            cache.set('episode', episode, timeout=None)

            agent.update_q_table(state, action, reward, next_state, next_action)
            cache.set('q_table', agent.q_table, timeout=None)
            
            state = next_state
            action = next_action
            update_agent_position(state)
            step += 1

        agent.decay_epsilon()
        cache.set('current_epsilon', agent.epsilon, timeout=None)

    return agent

def display_maze(maze, agent_pos, episode, step):
    print(f"maze to display: {maze}")
    print(f"Episode: {episode}, Step: {step}")
    for i, row in enumerate(maze):
        for j, cell in enumerate(row):
            if (i, j) == agent_pos:
                print('A', end=' ')  
            else:
                print(cell, end=' ')
        # print()
    get_position(agent_pos) 

def solve_maze(maze, agent, task_id):
    env = MazeEnvironment(maze)
    state = env.reset()
    done = False
    path = [state]

    print("Starting to solve the maze...")
    step = 0
    max_steps = 1000  

    while not done and step < max_steps:
        try:
            task_status = TaskStatus.objects.get(task_id=task_id)
            if task_status.status == 'cancelled':
                print(f'Task {task_id} cancelled during maze solving')
                return None
        except TaskStatus.DoesNotExist:
            pass  
        
        action = np.argmax(agent.q_table[state])
        next_state, reward, done = env.step(action)
        path.append(next_state)
        state = next_state
        
        step += 1
        display_maze(maze, state, episode=0, step=step)  
        update_agent_position(state)

        if state == env.goal:
            done = True
            print("Goal reached!")

    if step >= max_steps:
        print("Maximum steps reached. Maze solving stopped.")
        error="No Convergence"
        return error
        # cache.set('solution_path', error, timeout=None)

    else:
        print("Maze solving completed!")
    
    return path



import numpy as np

@csrf_exempt
def sarsaSSE(request):
    def event_stream():
        last_position = None
        last_epsilon = None
        last_q_table = None
        last_episode = None
        last_solution_path = None   
        consecutive_empty_count = 0
        max_empty_attempts = 10  

        while True:
            agent_position = cache.get('agent_position')
            current_epsilon = cache.get('current_epsilon')
            current_q_table = cache.get('q_table')
            episode = cache.get('episode')
            solution_path = cache.get('solution_path')  
            

            if agent_position is not None or current_epsilon is not None or current_q_table is not None or episode  is not None:
                data = {}
                if agent_position != last_position:
                    data['position'] = agent_position
                    last_position = agent_position
                if current_epsilon != last_epsilon:
                    data['epsilon'] = current_epsilon
                    last_epsilon = current_epsilon
                if not np.array_equal(current_q_table, last_q_table):
                    data['q_table'] = current_q_table.tolist() if isinstance(current_q_table, np.ndarray) else current_q_table
                    last_q_table = current_q_table
                if episode != last_episode:  
                    data['episode'] = episode
                    last_episode = episode
                if solution_path  != last_solution_path:
                    data['solution_path'] = solution_path   
                    last_solution_path = solution_path  
                
           
                if data:
                    yield f"data: {json.dumps(data)}\n\n"
                consecutive_empty_count = 0
            else:
                consecutive_empty_count += 1
                if consecutive_empty_count >= max_empty_attempts:
                    yield "data: {}\n\n"  
                    consecutive_empty_count = 0

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response





@csrf_exempt
def run_sarsa(request):
    if request.method == 'POST':
        cache_keys = ['agent_position', 'epsilon', 'q_table', 'episode', 'solution_path']
        try:
            for key in cache_keys:
                cache.delete(key)
            print('Cache successfully deleted')
        except Exception as e:
            print(f"Error while clearing cache: {e}")
        try:
            data = json.loads(request.body)
            time_value = 0
            episodes = int(data.get('episodes'))
            epsilon = float(data.get('epsilon', 1.0))
            epsilon_decay = float(data.get('epsilon_decay', 0.995))
            learning_rate = float(data.get('learning_rate', 0.1))
            
            task_id = data.get('task_id')
           
            print("running the sarsa function")
            result = sarsa_logic(episodes, time_value, epsilon, epsilon_decay, learning_rate, task_id)

            return JsonResponse({'status': 'success', 'message': 'SARSA training completed', 'task_id': task_id})
            
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)
