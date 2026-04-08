<<<<<<< HEAD
#include <stdio.h>

int n, m;

// 🔹 Calculate Need Matrix
void calculateNeed(int need[n][m], int max[n][m], int allot[n][m]) {
    for(int i = 0; i < n; i++)
        for(int j = 0; j < m; j++)
            need[i][j] = max[i][j] - allot[i][j];
}

// 🔹 Print Need Matrix
void printNeed(int need[n][m]) {
    printf("\nNeed Matrix:\n");
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < m; j++) {
            printf("%d ", need[i][j]);
        }
        printf("\n");
    }
}

// 🔹 Safety Algorithm
int isSafe(int processes[], int avail[], int max[n][m], int allot[n][m]) {
    int need[n][m];
    calculateNeed(need, max, allot);

    printNeed(need);

    int finish[n];
    for(int i = 0; i < n; i++)
        finish[i] = 0;

    int safeSeq[n];
    int work[m];

    for(int i = 0; i < m; i++)
        work[i] = avail[i];

    int count = 0;

    while(count < n) {
        int found = 0;

        for(int p = 0; p < n; p++) {
            if(finish[p] == 0) {
                int j;
                for(j = 0; j < m; j++)
                    if(need[p][j] > work[j])
                        break;

                if(j == m) {
                    printf("\n➡️ Process P%d is executing\n", p);

                    for(int k = 0; k < m; k++)
                        work[k] += allot[p][k];

                    printf("Updated Available: ");
                    for(int k = 0; k < m; k++)
                        printf("%d ", work[k]);
                    printf("\n");

                    safeSeq[count++] = p;
                    finish[p] = 1;
                    found = 1;
                }
            }
        }

        if(found == 0) {
            printf("\n❌ System is NOT in safe state\n");
            return 0;
        }
    }

    printf("\n✅ System is in SAFE state\nSafe sequence: ");
    for(int i = 0; i < n; i++)
        printf("P%d ", safeSeq[i]);

    printf("\n");
    return 1;
}

// 🔹 Resource Request
void requestResources(int avail[], int max[n][m], int allot[n][m]) {
    int pid;
    printf("\nEnter process number: ");
    scanf("%d", &pid);

    if(pid < 0 || pid >= n) {
        printf("Invalid process number\n");
        return;
    }

    int request[m];
    printf("Enter request vector: ");
    for(int i = 0; i < m; i++)
        scanf("%d", &request[i]);

    int need[n][m];
    calculateNeed(need, max, allot);

    for(int i = 0; i < m; i++) {
        if(request[i] > need[pid][i]) {
            printf("❌ Error: Request exceeds need\n");
            return;
        }
        if(request[i] > avail[i]) {
            printf("❌ Resources not available\n");
            return;
        }
    }

    // Try allocation
    for(int i = 0; i < m; i++) {
        avail[i] -= request[i];
        allot[pid][i] += request[i];
    }

    if(isSafe((int[]){0}, avail, max, allot))
        printf("✅ Request granted\n");
    else
        printf("❌ Request denied\n");
}

// 🔹 Main Function
int main() {
    printf("===== BANKER'S ALGORITHM =====\n");

    printf("Enter number of processes: ");
    scanf("%d", &n);

    printf("Enter number of resources: ");
    scanf("%d", &m);

    if(n <= 0 || m <= 0) {
        printf("Invalid input\n");
        return 0;
    }

    int processes[n];
    for(int i = 0; i < n; i++)
        processes[i] = i;

    int avail[m], max[n][m], allot[n][m];

    printf("\nEnter Allocation Matrix:\n");
    for(int i = 0; i < n; i++)
        for(int j = 0; j < m; j++)
            scanf("%d", &allot[i][j]);

    printf("\nEnter Max Matrix:\n");
    for(int i = 0; i < n; i++)
        for(int j = 0; j < m; j++)
            scanf("%d", &max[i][j]);

    printf("\nEnter Available Resources:\n");
    for(int i = 0; i < m; i++)
        scanf("%d", &avail[i]);

    int choice;

    do {
        printf("\n===== MENU =====\n");
        printf("1. Check Safe State\n");
        printf("2. Request Resources\n");
        printf("3. Exit\n");
        printf("Enter choice: ");
        scanf("%d", &choice);

        switch(choice) {
            case 1:
                isSafe(processes, avail, max, allot);
                break;

            case 2:
                requestResources(avail, max, allot);
                break;

            case 3:
                printf("Exiting...\n");
                break;

            default:
                printf("Invalid choice\n");
        }

    } while(choice != 3);

    return 0;
}
=======
#include <stdio.h>

int n, m;

void calculateNeed(int need[n][m], int max[n][m], int allot[n][m]) {
    for (int i = 0 ; i < n ; i++)
        for (int j = 0 ; j < m ; j++)
            need[i][j] = max[i][j] - allot[i][j];
}

int isSafe(int processes[], int avail[], int max[][m], int allot[][m]) {
    int need[n][m];
    calculateNeed(need, max, allot);

    int finish[n];
    for (int i = 0; i < n; i++)
        finish[i] = 0;

    int safeSeq[n];
    int work[m];

    for (int i = 0; i < m; i++)
        work[i] = avail[i];

    int count = 0;

    while (count < n) {
        int found = 0;
        for (int p = 0; p < n; p++) {
            if (finish[p] == 0) {
                int j;
                for (j = 0; j < m; j++)
                    if (need[p][j] > work[j])
                        break;

                if (j == m) {
                    for (int k = 0; k < m; k++)
                        work[k] += allot[p][k];

                    safeSeq[count++] = p;
                    finish[p] = 1;
                    found = 1;
                }
            }
        }

        if (found == 0) {
            printf("\nSystem is NOT in safe state\n");
            return 0;
        }
    }

    printf("\nSystem is in SAFE state\nSafe sequence: ");
    for (int i = 0; i < n; i++)
        printf("P%d ", safeSeq[i]);

    printf("\n");
    return 1;
}

int main() {
    printf("Enter number of processes: ");
    scanf("%d", &n);

    printf("Enter number of resources: ");
    scanf("%d", &m);

    int processes[n];
    for (int i = 0; i < n; i++)
        processes[i] = i;

    int avail[m], max[n][m], allot[n][m];

    printf("\nEnter Allocation Matrix:\n");
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            scanf("%d", &allot[i][j]);

    printf("\nEnter Max Matrix:\n");
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            scanf("%d", &max[i][j]);

    printf("\nEnter Available Resources:\n");
    for (int i = 0; i < m; i++)
        scanf("%d", &avail[i]);

    isSafe(processes, avail, max, allot);

    return 0;
}
>>>>>>> 64783160c4633be77e870277627e1b4291d4bb32
