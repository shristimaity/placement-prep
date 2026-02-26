// fibonacci using memoization

import java.util.*;
public class fibo_memo{

    int fibo(int n, int dp[]){
        if (n <= 1){
            return n;
        }
        if( dp[n] != -1){
            return dp[n];
        }
        dp[n]=fibo(n-1, dp) + fibo(n-2, dp);
        return dp[n];
        
    }
    public static void main(String[] args){
        Scanner in= new Scanner(System.in);
     fibo_memo obj=new fibo_memo();
     int n= in.nextInt();
     int [] dp = new int[n+1];
     Arrays.fill(dp, -1);
     System.out.println(obj.fibo(n, dp));
    }
}