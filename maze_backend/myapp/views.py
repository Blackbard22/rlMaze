# from django.shortcuts import render
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# import json
# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync,  sync_to_async
# from django.http import StreamingHttpResponse
# import time



# async def send_data_to_websocket(request):
#     print("Sending data to WebSocket")
#     channel_layer = get_channel_layer()

#     if not channel_layer:
#         raise RuntimeError("Channel layer is not initialized.")
    
#     data = {"message": "Hello WebSocket!"}
#     await channel_layer.group_send(
#         "data_group",
#         {
#             "type": "send_data",
#             "data": data
#         }
#     )

# @sync_to_async
# def trigger_websocket(request):
#     test_data = {"message": "Hello WebSocket!"}
#     print("Triggering WebSocket")
#     send_data_to_websocket()
#     return JsonResponse({"status": "Data sent to WebSocket"})



# agnet_final_position = [0,4]


# def get_position(position):
#     agnet_final_position == [position[0], position[1]]



# @csrf_exempt
# def sse_view(request):
#     def event_stream():
#         while True:

#             data = f"data: {json.dumps(agnet_final_position)}\n\n"
#             yield data
#             time.sleep(1)  # Send updates every second

#     return StreamingHttpResponse(event_stream(), content_type='text/event-stream')


# @csrf_exempt
# def run_qlearn(request):
#     if request.method == 'POST':
#         try:
#             data = json.loads(request.body)
#             time = data.get('time')  
#             episodes = data.get('episodes')  

#             # Debugging: print the values to ensure they're coming through
#             print(f"time: {time}, episodes: {episodes}")

#             result = run_qlearn_func(episodes, time)
            
#             return JsonResponse({'status': 'success', 'result': result})
            
#         except json.JSONDecodeError:
#             return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
#     else:
#         return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)
    


# def run_qlearn_func(episodeValue,timeValue):
#     import numpy as np
#     import random
#     import time
#     import os

   

#     class MazeEnvironment:
#         def __init__(self, maze):
#             self.maze = maze
#             self.start = self.find_position('S')
#             self.goal = self.find_position('G')
#             self.current_state = self.start

#         def find_position(self, char):
#             return next((i, j) for i, row in enumerate(self.maze) for j, c in enumerate(row) if c == char)

#         def reset(self):
#             self.current_state = self.start
#             return self.current_state

#         def step(self, action):
#             moves = [(-1, 0), (0, 1), (1, 0), (0, -1)]
#             new_state = (self.current_state[0] + moves[action][0], 
#                         self.current_state[1] + moves[action][1])

#             if self.is_valid_move(new_state):
#                 self.current_state = new_state
#                 if self.current_state == self.goal:
#                     return new_state, 1, True  # Reached goal
#                 return new_state, -0.01, False  # Small negative reward for each step
#             return self.current_state, -1, False  # Hit a wall

#         def is_valid_move(self, state):
#             return (0 <= state[0] < len(self.maze) and
#                     0 <= state[1] < len(self.maze[0]) and
#                     self.maze[state[0]][state[1]] != '#')

#     class QLearningAgent:
#         def __init__(self, state_size, action_size, learning_rate=0.1, discount_factor=0.95, epsilon=1.0, epsilon_decay=0.995, epsilon_min=0.01):
#             self.state_size = state_size
#             self.action_size = action_size
#             self.q_table = np.zeros((state_size[0], state_size[1], action_size))
#             self.lr = learning_rate
#             self.gamma = discount_factor
#             self.epsilon = epsilon
#             self.epsilon_decay = epsilon_decay
#             self.epsilon_min = epsilon_min

#         def get_action(self, state):
#             if random.uniform(0, 1) < self.epsilon:
#                 return random.randint(0, self.action_size - 1)  # Explore
#             return np.argmax(self.q_table[state])  # Exploit

#         def update_q_table(self, state, action, reward, next_state, done):
#             current_q = self.q_table[state][action]
#             if done:
#                 next_max_q = 0
#             else:
#                 next_max_q = np.max(self.q_table[next_state])
#             new_q = current_q + self.lr * (reward + self.gamma * next_max_q - current_q)
#             self.q_table[state][action] = new_q

#         def decay_epsilon(self):
#             self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)

#     def clear_console():
#         os.system('cls' if os.name == 'nt' else 'clear')

#     def display_maze(maze, agent_pos, episode, step):
#         clear_console()
#         print(f"Episode: {episode}, Step: {step}")
#         for i, row in enumerate(maze):
#             for j, cell in enumerate(row):
#                 if (i, j) == agent_pos:
#                     print('A', end=' ')  # 'A' represents the agent
#                 else:
#                     print(cell, end=' ')
#             print()
#             get_position(agent_pos)
#         time.sleep(int(timeValue))  # Add a small delay to make the visualization visible
#         # def event_stream():
#         #     while True:
#         #         data = f"data: {json.dumps(agnet_final_position)}\n\n"
#         #         yield data
#         #         time.sleep(1)  
#         # return StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    

#     def train_q_learning(maze, episodes=1000):
#         env = MazeEnvironment(maze)
#         state_size = (len(maze), len(maze[0]))
#         action_size = 4  # up, right, down, left
#         agent = QLearningAgent(state_size, action_size)

#         for episode in range(episodes):
#             state = env.reset()
#             done = False
#             total_reward = 0
#             step = 0

#             while not done:
#                 display_maze(maze, state, episode, step)
#                 action = agent.get_action(state)
#                 next_state, reward, done = env.step(action)
#                 agent.update_q_table(state, action, reward, next_state, done)
#                 state = next_state
#                 total_reward += reward
#                 step += 1

#             agent.decay_epsilon()

#             if episode % 10 == 0:  # Reduced frequency of printing to avoid overwhelming output
#                 print(f"Episode: {episode}, Total Reward: {total_reward}, Epsilon: {agent.epsilon:.2f}")

#         return agent

#     def solve_maze(maze, agent):
#         env = MazeEnvironment(maze)
#         state = env.reset()
#         done = False
#         path = [state]
#         step = 0

#         while not done:
#             display_maze(maze, state, "Solution", step)
#             action = np.argmax(agent.q_table[state])
#             next_state, reward, done = env.step(action)
#             path.append(next_state)
#             state = next_state
#             step += 1

#         return path

    
#     maze = [
#         ['S', '.', '#', '#', '#'],
#         ['.', '.', '.', '.', '#'],
#         ['#', '#', '#', 'G', '#'],
#         ['#', '.', '.', '.', '#'],
#         ['#', '.', '#', '.', '.']
#     ]

#     trained_agent = train_q_learning(maze, episodes=int(episodeValue))  
#     solution_path = solve_maze(maze, trained_agent)

    # return solution_path

    # print("Solution path:", solution_path)

    # Visualize the final solution
    # print("\nFinal Solution:")
    # for i, row in enumerate(maze):
    #     for j, cell in enumerate(row):
    #         if (i, j) in solution_path:
    #             print('O', end=' ')
    #         else:
    #             print(cell, end=' ')
    #     print()

    # return JsonResponse({"solution_path": solution_path})
    # return solution_path
    # def event_stream():
    #     while True:
    #         # data = f"data: Current time is {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    #         # yield data
    #         # time.sleep(1)
    #         data = f"data: {json.dumps(agnet_final_position)}\n\n"
    #         yield data
    #         time.sleep(1)  
    # return StreamingHttpResponse(event_stream(), content_type='text/event-stream')
    


    
    
from django.http import StreamingHttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import time
import numpy as np
import random
import os

# Global variable for agent position (to be shared with SSE)
agent_final_position = [0, 1]

def get_position(position):
    global agent_final_position
    agent_final_position = [position[0], position[1]]

# SSE view for streaming the agent's position
@csrf_exempt
def sse_view(request):
    def event_stream():
        while True:
            # Stream the agent's final position as JSON
            data = f"data: {json.dumps(agent_final_position)}\n\n"
            yield data
            time.sleep(0.5)  # Send updates every second

    return StreamingHttpResponse(event_stream(), content_type='text/event-stream')

# Main function for training and streaming
@csrf_exempt
def run_qlearn(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            time_value = data.get('time')
            episodes = data.get('episodes')

            # Start training and return JSON response when complete
            result = run_qlearn_func(episodes, time_value)
            return JsonResponse({'status': 'success', 'result': result})
            
        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'message': 'Invalid JSON'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

# Q-learning training function with streaming positions
def run_qlearn_func(episode_value, time_value):
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
        print(f"Episode: {episode}, Step: {step}")
        for i, row in enumerate(maze):
            for j, cell in enumerate(row):
                if (i, j) == agent_pos:
                    print('A', end=' ')  # 'A' represents the agent
                else:
                    print(cell, end=' ')
            print()
        get_position(agent_pos)
        # time.sleep(int(time_value))  # Add a small delay to make the visualization visible

    def train_q_learning(maze, episodes=1000):
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
                display_maze(maze, state, episode, step)
                action = agent.get_action(state)
                next_state, reward, done = env.step(action)
                agent.update_q_table(state, action, reward, next_state, done)
                state = next_state
                total_reward += reward
                step += 1

            agent.decay_epsilon()

            if episode % 10 == 0:  # Reduced frequency of printing to avoid overwhelming output
                print(f"Episode: {episode}, Total Reward: {total_reward}, Epsilon: {agent.epsilon:.2f}")

        return agent

    def solve_maze(maze, agent):
        env = MazeEnvironment(maze)
        state = env.reset()
        done = False
        path = [state]
        step = 0

        while not done:
            display_maze(maze, state, "Solution", step)
            action = np.argmax(agent.q_table[state])
            next_state, reward, done = env.step(action)
            path.append(next_state)
            state = next_state
            step += 1

        return path

    maze = [
        ['S', '.', '#', '#', '#'],
        ['.', '.', '.', '.', '#'],
        ['#', '#', '#', 'G', '#'],
        ['#', '.', '.', '.', '#'],
        ['#', '.', '#', '.', '.']
    ]

    trained_agent = train_q_learning(maze, episodes=int(episode_value))
    solution_path = solve_maze(maze, trained_agent)

    return solution_path
