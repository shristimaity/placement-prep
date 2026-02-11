
import java.util.*;
public class sum_Of_n  {

    //parameterised
//    void function(int i, int sum){
//      if(i<1){
//         System.out.print(sum);
//         return;
//      }
//      function(i-1, sum+i);
//     }
//     public static void main(){
//         Scanner in=new Scanner(System.in);
//         lec_3 obj=new lec_3();
//         int n=in.nextInt();
//         obj.function(n,0);
//     }

//functional
int function(int N){
    if(N==0)
        return 0;
    return N+function(N-1);
}
public static void main(){
    Scanner in=new Scanner(System.in);
    sum_Of_n  obj=new sum_Of_n ();
    int n=in.nextInt();
    System.out.println(obj.function(n));
}
}


