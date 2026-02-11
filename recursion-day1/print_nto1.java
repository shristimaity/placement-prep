//Print n to 1
import java.util.*;
public class print_nto1{
    void function(int i,int n){
     if(i<1){
        return;
     }
     System.out.println(i);
     function(i-1,n);
    }
    public static void main(){
        Scanner in=new Scanner(System.in);
        int N=in.nextInt();
        print_nto1 obj=new print_nto1();
        obj.function(N,N);
    }
}


