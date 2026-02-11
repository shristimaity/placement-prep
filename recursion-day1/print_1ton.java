//print linearly 1 to N
import java.util.*;
public class print_1ton{
 void function(int i, int N){
    if(i > N){
        return;
    }
    System.out.println(i);
    function(i+1,N);
}
public static void main(){
    Scanner in= new Scanner(System.in);
    int n= in.nextInt();
    print_1ton obj = new print_1ton();
    obj.function(1,n);
}
}

// Print n to 1
// import java.util.*;
// public class lec_2{
//     void function(int i,int n){
//      if(i<1){
//         return;
//      }
//      System.out.println(i);
//      function(i-1,n);
//     }
//     public static void main(){
//         Scanner in=new Scanner(System.in);
//         int N=in.nextInt();
//         lec_2 obj=new lec_2();
//         obj.function(N,N);
//     }
// }


//print linearly 1 to N but by backtracking
// import java.util.*;
// public class lec_2{
//     void function(int i, int N){
//         if(i<1){
//             return;
//         }
//         function(i-1,N);
//         System.out.println(i);
//         }

//         public static void main(){
//             Scanner in=new Scanner(System.in);
//             int N=in.nextInt();
//             lec_2 obj=new lec_2();
//             obj.function(N,N);
//                 }
// }


//print from N to 1
// import java.util.*;
// public class lec_2{
//    void function(int i,int N){
//     if(i>N){
//         return;
//     }
//     function(i+1, N);
//     System.out.println(i);
//    }
//    public static void main(){
//     Scanner in=new Scanner(System.in);
//     lec_2 obj = new lec_2();
//     int N=in.nextInt();
//     obj.function(1,N);
//    }
// }
// }
