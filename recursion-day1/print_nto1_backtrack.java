//print from N to 1
import java.util.*;
public class print_nto1_backtrack{
   void function(int i,int N){
    if(i>N){
        return;
    }
    function(i+1, N);
    System.out.println(i);
   }
   public static void main(){
    Scanner in=new Scanner(System.in);
    print_nto1_backtrack obj = new print_nto1_backtrack();
    int N=in.nextInt();
    obj.function(1,N);
   }
}

