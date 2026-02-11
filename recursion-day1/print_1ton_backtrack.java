//print linearly 1 to N but by backtracking
import java.util.*;
public class print_1ton_backtrack {
    void function(int i, int N){
        if(i<1){
            return;
        }
        function(i-1,N);
        System.out.println(i);
        }

        public static void main(){
            Scanner in=new Scanner(System.in);
            int N=in.nextInt();
            print_1ton_backtrack obj=new print_1ton_backtrack();
            obj.function(N,N);
                }
}

