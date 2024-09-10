# views.py
import numpy as np
import random
import time
import os
from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views import View

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

def train_sarsa(maze, episodes=4):
    env = MazeEnvironment(maze)
    state_size = (len(maze), len(maze[0]))
    action_size = 4  # up, right, down, left
    agent = SARSAAgent(state_size, action_size)

    for episode in range(episodes):
        state = env.reset()
        action = agent.get_action(state)
        done = False

        while not done:
            next_state, reward, done = env.step(action)
            next_action = agent.get_action(next_state)
            
            agent.update_q_table(state, action, reward, next_state, next_action)
            
            state = next_state
            action = next_action

        agent.decay_epsilon()

    return agent

def solve_maze(maze, agent):
    env = MazeEnvironment(maze)
    state = env.reset()
    done = False
    path = [state]

    while not done:
        action = np.argmax(agent.q_table[state])
        next_state, reward, done = env.step(action)
        path.append(next_state)
        state = next_state

    return path

class sarsaView(View):
    def get(self, request, *args, **kwargs):
        maze = [
            ['S', '.', '#', '#', '#'],
            ['.', '.', '.', '.', '#'],
            ['#', '#', '#', '.', '#'],
            ['#', '.', '.', '.', '#'],
            ['#', '.', '#', '.', 'G']
        ]

        agent = train_sarsa(maze, episodes=500)  # Train the agent
        solution_path = solve_maze(maze, agent)  # Solve the maze

        return JsonResponse({
            'maze': maze,
            'solution_path': solution_path
        })
