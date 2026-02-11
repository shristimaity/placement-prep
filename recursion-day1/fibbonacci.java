import java.util.*;
public class fibbonacci {

    int function(int n){
        if(n<=1){
            return n;
        }
        int last=function(n-1);
        int slast=function(n-2);
        return last+slast;
    }

    public static void main(String[] args){
        Scanner in=new Scanner(System.in);
        fibbonacci obj=new fibbonacci();
        int n=in.nextInt();
        System.out.println(obj.function(n));
    }
}