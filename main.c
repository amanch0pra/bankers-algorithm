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
