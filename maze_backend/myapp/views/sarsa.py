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



# Global variable to store the agent's current position
agent_current_position = [0, 6]

def update_agent_position(position):
    global agent_current_position
    agent_current_position = [position[0], position[1]]

def get_position(position):
    # global agent_final_position
    # agent_final_position = [position[0], position[1]]
    cache.set('agent_position', position, timeout=None)


@task()
def sarsa_logic(episodes, time_value, epsilon, epsilon_decay, learning_rate, task_id):
    maze_object = Maze.objects.first()
    maze = json.loads(maze_object.layout)


    # Train the SARSA agent with the provided parameters
    agent = train_sarsa(maze, episodes=episodes, epsilon=epsilon, epsilon_decay=epsilon_decay, learning_rate=learning_rate, task_id=task_id)  
    
    solution_path = solve_maze(maze, agent, task_id)  # Solve the maze

    return {
        'solution_path': solution_path,
        'algo': 'sarsa',
        'time': time_value,
        'status': 'completed'
    }

# Maze and SARSA related classes (same as in your original code)
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

def train_sarsa(maze, episodes=4, epsilon=1.0, epsilon_decay=0.995, learning_rate=0.1, task_id=None):
    env = MazeEnvironment(maze)
    state_size = (len(maze), len(maze[0]))
    action_size = 4  # up, right, down, left

    agent = SARSAAgent(state_size, action_size, learning_rate=learning_rate, epsilon=epsilon, epsilon_decay=epsilon_decay)

    for episode in range(episodes):
        state = env.reset()
        action = agent.get_action(state)
        done = False
        step = 0
        print(f"task id is recieved:    {task_id}") 
        for episode in range(episodes):
            # Check if the task should be cancelled
            try:
                task_status = TaskStatus.objects.get(task_id=task_id)
                if task_status.status == 'cancelled':
                    print(f'Task {task_id} cancelled')
                    return None
            except TaskStatus.DoesNotExist:
                pass  # Task not cancelled, continue execution

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
    

            
            agent.update_q_table(state, action, reward, next_state, next_action)
            
            state = next_state
            action = next_action
            update_agent_position(state)
            # time.sleep(0.3)
            step += 1

        agent.decay_epsilon()

    return agent

def display_maze(maze, agent_pos, episode, step):
    print(f"maze to display: {maze}")
    print(f"Episode: {episode}, Step: {step}")
    for i, row in enumerate(maze):
        for j, cell in enumerate(row):
            if (i, j) == agent_pos:
                print('A', end=' ')  # 'A' represents the agent
            else:
                print(cell, end=' ')
        # print()
    get_position(agent_pos) 

def solve_maze(maze, agent, task_id):
    env = MazeEnvironment(maze)
    state = env.reset()
    done = False
    path = [state]

    while not done:
            try:
                task_status = TaskStatus.objects.get(task_id=task_id)
                if task_status.status == 'cancelled':
                    print(f'Task {task_id} cancelled during maze solving')
                    return None
            except TaskStatus.DoesNotExist:
                pass  # Task not cancelled, continue execution
            action = np.argmax(agent.q_table[state])
            next_state, reward, done = env.step(action)
            path.append(next_state)
            state = next_state

    return path

# SSE stream for sending the agent's position
def sarsaSSE(request):
    def event_stream():
        last_position = None
        consecutive_empty_count = 0
        max_empty_attempts = 10  # Adjust as needed

        while True:
            agent_position = cache.get('agent_position')

            if agent_position is not None:
                if agent_position != last_position:
                    data = f"data: {json.dumps(agent_position)}\n\n"
                    yield data
                    last_position = agent_position
                consecutive_empty_count = 0
            else:
                consecutive_empty_count += 1
                if consecutive_empty_count >= max_empty_attempts:
                    yield "data: {}\n\n"  # Send empty data to keep connection alive
                    consecutive_empty_count = 0

            # time.sleep(0.3)  # Adjust the interval as needed

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response



@csrf_exempt
def cancel_sarsa_training(request):
    return JsonResponse({'status': 'error', 'message': 'Cancellation not supported'}, status=400)




@csrf_exempt
def run_sarsa(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            time_value = int(data.get('time'))
            episodes = int(data.get('episodes'))
            # epsilon = int(data.get('epsilon', 1.0))
            # epsilon_decay = int(data.get('epsilon_decay', 0.995))
            # learning_rate = int(data.get('learning_rate', 0.1))
            epsilon =  1.0
            epsilon_decay =  0.995
            learning_rate =  0.1
            task_id = data.get('task_id')
            
            # Directly call the SARSA logic
            result = sarsa_logic(episodes, time_value, epsilon, epsilon_decay, learning_rate, task_id)

            return JsonResponse({'status': 'success', 'message': 'SARSA training completed', 'task_id': task_id})
            
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)