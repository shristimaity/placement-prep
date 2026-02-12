
import java.util.*;
public  class no_of_subsequences_sum {
    int function(int index, int arr[],List<Integer> list, int s, int sum){
          if(index == arr.length){
            if(s == sum)
               return 1;
            else
            return 0;
        }
        list.add(arr[index]);
        s+=arr[index];
        int l=function(index+1,arr,list,s,sum);
          
        s-=arr[index];
        list.remove(list.size()-1);
        int r=function(index+1,arr,list,s,sum);

        return l+r;
    }

    public static void main(String []args){
        Scanner in=new Scanner(System.in);
        no_of_subsequences_sum obj=new no_of_subsequences_sum();
        int arr[]={1,2,1};
        int sum=2;
        int result=obj.function(0,arr,new ArrayList<>(),0,sum);
        System.out.println(result);
    }
}
