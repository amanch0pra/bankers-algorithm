# Banker's Algorithm Visualizer 🚀✨

**A futuristic, interactive web-based simulator for visualizing the Banker's Algorithm—a resource allocation and deadlock avoidance algorithm used in Operating Systems.**

## 🌟 Overview

The **Banker's Algorithm Visualizer** allows users to simulate how an Operating System manages resource allocation to avoid deadlocks. This project features a completely custom, modern **Neon Cyberpunk & Glassmorphism UI**, turning complex OS concepts into an engaging and accessible visual experience. 

The application calculates the **Need Matrix**, audits the **Available Resources**, and ultimately determines a **Safe Sequence** by executing processes step-by-step, ensuring the system never enters an unsafe deadlock state.

## ✨ Features

- **Dynamic System Configuration:** Configure any valid number of Processes and Resource types. Easily input your Allocation, Max, and Initial Available data matrices.
- **Auto & Manual Execution Modes:** 
  - *Auto Mode:* Automatically processes data to instantly display the safe sequence or deadlock state.
  - *Manual Mode:* Gives users a Step-by-step execution. Includes a **Simulation Logic Reasoner** dashboard that explains exactly *why* a particular process is selected or skipped during the OS auditing phase.
- **Premium Glassmorphism UI:** Designed from the ground up with sleek frosted glass panels, glowing neon accents, and interactive CSS keyframe animations to give a premium cyber-app feel.
- **Real-Time Visual Dashboards:** Process queue charts natively update to visually represent allocated vs. required resource bars.
- **State-aware Modals:** Custom alerts dynamically indicate if the system successfully reached a Safe State, complete with a sequence chart, or if a System Deadlock is detected.

## 🛠️ Technologies Used

- **Structure:** HTML5 Semantic Markup
- **Styling:** Vanilla CSS3 (Custom Variables, Flexbox/Grid, Keyframe Animations, Glassmorphism and Neon glow effects)
- **Logic & State Management:** Vanilla JavaScript (ES6+), DOM Manipulation, Event Handling

## 📖 How It Works (The Core Algorithm)

1. **Initialization:** The user defines the number of running `Processes` and total `Resource Types`.
2. **Current State Input:** User fills out:
   - **Allocation Matrix:** Resources currently held by each process.
   - **Max Matrix:** Total resources each process might eventually request.
   - **Available Array:** The pool of unallocated system resources freely available.
3. **Internal Processing:** The system instantly computes the **Need Matrix** using the core formula:
   > `Need[i][j] = Max[i][j] - Allocation[i][j]`
4. **The Safety Auditing Cycle:**
   - The OS algorithm scans for an unfinished process where its `Need` is strictly $\le$ `Available` resources.
   - If a valid candidate is found, the OS virtually "loans" the required resources so the process can complete its execution.
   - Upon simulated completion, the process is marked as finished and releases all its previously held resources back into the total `Available` pool:
     > `New Available Pool = Current Available + Allocation[i]`
   - This auditing cycle repeats until either **all processes successfully finish** (Yielding a **Safe Sequence**) OR **no single process can satisfy its resource need** (Yielding an unsafe **Deadlock**).

## 🚀 How to Run Locally

You don't need any complex setups, package managers (NPM), or build tools to run this simulator!

1. Clone this repository locally to your machine:
   ```bash
   git clone https://github.com/amanch0pra/bankers-algorithm.git
   ```
2. Navigate into the freshly cloned project directory folder.
3. Simply launch the visualizer by opening the `index.html` file in any modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge):
   - You can normally just double-click the file, OR
   - Right-click $\rightarrow$ *Open With* $\rightarrow$ *[Your Browser of Choice]*

## 💡 Credit
Developed and redesigned by **[@amanch0pra](https://github.com/amanch0pra)**. 

Enjoy exploring Operating Systems through interactive visuals! Feel free to star the repo if you found this simulation helpful.
