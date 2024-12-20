

from ..tasks import my_first_task
from django.http import HttpResponse, JsonResponse
import time
from django.views.decorators.csrf import csrf_exempt



from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from huey.contrib.djhuey import HUEY
import sqlite3

from django.db import OperationalError, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..tasks import long_running_task
from ..models import TaskStatus
import uuid
from time import sleep

@csrf_exempt
def start_task(request):
    task_id = str(uuid.uuid4())
    task = long_running_task(task_id)
    return JsonResponse({"task_id": task_id, "message": "Task started"})
    

@csrf_exempt
def cancel_task(request, task_id):
    MAX_RETRIES = 5
    BASE_RETRY_DELAY = 0.1

    cache_keys = ['agent_position', 'epsilon', 'q_table', 'episode', 'solution_path']
    try:
        for key in cache_keys:
            cache.delete(key)
    except Exception as e:
        print(f"Error while clearing cache: {e}")

    for attempt in range(MAX_RETRIES):
        try:
            with transaction.atomic():
                # Use select_for_update with a timeout to prevent prolonged locks
                task = TaskStatus.objects.select_for_update(nowait=True).filter(task_id=task_id).first()
                
                if task:
                    task.status = 'cancelled'
                    task.save()
                else:
                    # Create a new task status if it doesn't exist
                    TaskStatus.objects.create(task_id=task_id, status='cancelled')

                return JsonResponse({
                    "status": "Task cancellation requested",
                    "task_id": task_id
                })
        
        except OperationalError as e:
            # Exponential backoff with jitter to prevent thundering herd problem
            if "database is locked" in str(e) or "could not obtain lock" in str(e):
                if attempt < MAX_RETRIES - 1:
                    # Exponential backoff with jitter
                    delay = BASE_RETRY_DELAY * (2 ** attempt) * (1 + random.random())
                    sleep(delay)
                else:
                    return JsonResponse({
                        "status": "Failed to cancel task due to persistent database lock",
                        "task_id": task_id,
                        "error": str(e)
                    }, status=500)
            else:
                return JsonResponse({
                    "status": "Unexpected error occurred",
                    "task_id": task_id,
                    "error": str(e)
                }, status=500)





from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from ..models import Maze
import json
import time
import numpy as np
import random
import os
from huey.contrib.djhuey import task

from django.core.cache import cache
from django.views.decorators.cache import cache_page


agent_final_position = [0, 1]

def get_position(position):
        cache.set('agent_position', position, timeout=None)
       




from django.http import StreamingHttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
import json
import time



@csrf_exempt
def sse_view(request):
    def event_stream():
        last_data = None
        consecutive_empty_count = 0
        max_empty_attempts = 10  # Adjust as needed

        while True:
            agent_position = cache.get('agent_position')
            epsilon = cache.get('epsilon')
            q_table = cache.get('q_table')
            episode = cache.get('episode')  
            solution_path = cache.get('solution_path')  
            

            if agent_position is not None and epsilon is not None and q_table is not None:
                current_data = {
                    'position': agent_position,
                    'epsilon': epsilon,
                    'q_table': q_table.tolist() ,
                    'episode': episode,
                    'solution_path': solution_path
                }
                if current_data != last_data:
                    data = f"data: {json.dumps(current_data)}\n\n"
                    yield data
                    last_data = current_data
                consecutive_empty_count = 0
            else:
                consecutive_empty_count += 1
                if consecutive_empty_count >= max_empty_attempts:
                    yield "data: {}\n\n"  # Send empty data to keep connection alive
                    consecutive_empty_count = 0

            time.sleep(0.3)  # Adjust the interval as needed

    response = StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    response['X-Accel-Buffering'] = 'no'
    return response


# Q-learning training function with streaming positions
@task()
def run_qlearn_func(episode_value, time_value, task_id, epsilon_value, epsilon_decay_value, learning_rate_value):
    import numpy as np
    import random
    import time
    import os

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

    class QLearningAgent:
        def __init__(self, state_size, action_size, learning_rate=learning_rate_value, discount_factor=0.95, epsilon=epsilon_value, epsilon_decay=epsilon_decay_value, epsilon_min=0.01):
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

        def update_q_table(self, state, action, reward, next_state, done):
            current_q = self.q_table[state][action]
            if done:
                next_max_q = 0
            else:
                next_max_q = np.max(self.q_table[next_state])
            new_q = current_q + self.lr * (reward + self.gamma * next_max_q - current_q)
            self.q_table[state][action] = new_q

        def decay_epsilon(self):
            self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

    

    def clear_console():
        os.system('cls' if os.name == 'nt' else 'clear')

    def display_maze(maze, agent_pos, episode, step):
        clear_console()
        print(f"maze to display: {maze}")
        # time.sleep(20)
        print(f"Episode: {episode}, Step: {step}")
        for i, row in enumerate(maze):
            for j, cell in enumerate(row):
                if (i, j) == agent_pos:
                    print('A', end=' ')  # 'A' represents the agent
                else:
                    print(cell, end=' ')
            print()
        get_position(agent_pos)
        # time.sleep(int(time_value))  

    

    def train_q_learning(maze, episodes=500):
        env = MazeEnvironment(maze)
        state_size = (len(maze), len(maze[0]))
        action_size = 4  # up, right, down, left
        agent = QLearningAgent(state_size, action_size)

        for episode in range(episodes):
            state = env.reset()
            done = False
            total_reward = 0
            step = 0

            while not done:
                try:
                    task_status = TaskStatus.objects.get(task_id=task_id)
                    if task_status.status == 'cancelled':
                        print(f'Task {task_id} cancelled')
                        return None
                except TaskStatus.DoesNotExist:
                    pass  
                display_maze(maze, state, episode, step)
                action = agent.get_action(state)
                next_state, reward, done = env.step(action)
                agent.update_q_table(state, action, reward, next_state, done)
                state = next_state
                total_reward += reward
                step += 1

                get_position(state)
                cache.set('epsilon', agent.epsilon, timeout=None)
                cache.set('q_table', agent.q_table, timeout=None)
                cache.set('episode', episode, timeout=None)
                
            agent.decay_epsilon()

            if episode % 10 == 0:
                print(f"Episode: {episode}, Total Reward: {total_reward}, Epsilon: {agent.epsilon:.2f}")

        return agent
    
    
    def solve_maze(maze, agent, max_steps=1000):
        env = MazeEnvironment(maze)
        state = env.reset()
        done = False
        path = [state]
        step = 0

        while not done and step<max_steps:
            try:
                task_status = TaskStatus.objects.get(task_id=task_id)
                if task_status.status == 'cancelled':
                    print(f'Task {task_id} cancelled during maze solving')
                    return None
            except TaskStatus.DoesNotExist:
                pass 

            display_maze(maze, state, "Solution", step)
            action = np.argmax(agent.q_table[state[0], state[1]])
            next_state, reward, done = env.step(action)
            path.append(next_state)
            state = next_state
            step += 1
        if step >= max_steps:
            print("Maximum steps reached. Maze solving stopped.")
            error="No Convergence"
            
            return error

        return path
    

    maze_object = Maze.objects.first()
    maze = json.loads(maze_object.layout)

    print(f"maze type: {type(maze)}")   
    time.sleep(3)

    trained_agent = train_q_learning(maze, episodes=int(episode_value))
    if trained_agent is None:
        return "Task cancelled during training"

    solution_path = solve_maze(maze, trained_agent)
    if solution_path is None:
        return "Task cancelled during maze solving"

    cache.set('solution_path', solution_path, timeout=None) 
    return solution_path




@csrf_exempt
def save_maze(request):
    if request.method == 'POST':
        try:
            # Parse the incoming JSON data from the request
            data = json.loads(request.body)
            maze_data = data.get('maze', [])

            # Delete any existing maze data
            Maze.objects.all().delete()

            # Create and save the new maze
            new_maze = Maze(layout=json.dumps(maze_data)) 
            print(f"Received maze data: {new_maze.layout}")
            new_maze.save()

            return JsonResponse({'status': 'success', 'message': 'Maze saved successfully'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)



def get_maze(request):
    try:
        # Fetch the first maze record from the database
        maze = Maze.objects.first()

        if not maze:
            return JsonResponse({'status': 'error', 'message': 'No maze found'}, status=404)

        # Return the maze layout
        return JsonResponse({'status': 'success', 'maze': maze.maze_layout})
    except Exception as e:
        # Log or handle the exception
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)




def fetch_maze():
    try:
        maze = Maze.objects.first()
        if not maze:
            raise ValueError("No maze found")
        return maze.layout
    except Exception as e:
        print(f"Error fetching maze: {e}")
        return None





@csrf_exempt
def run_qlearn(request):
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

            episodes = int(data.get('episodes', 1.0))

            task_id = data.get('task_id')
            epsilon_value = float(data.get('epsilon', 1.0))
            epsilon_decay_value = float(data.get('epsilon_decay', 0.995))
            learning_rate_value = float(data.get('learning_rate', 0.1)) 

            print(f"epsilon value: {epsilon_value}")    
            print(f"epsilon decay value: {epsilon_decay_value}")
            print(f"learning rate value: {learning_rate_value}")    
            time.sleep(2)
                                          
            


            # Start training and return JSON response when complete
            print("running the qlearn function")
            result = run_qlearn_func(episodes, time_value, task_id, epsilon_value, epsilon_decay_value, learning_rate_value)
            return JsonResponse({'status': 'Running_Qlearn', 'task_id': task_id})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)