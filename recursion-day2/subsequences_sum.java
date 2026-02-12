import java.util.*;
public  class subsequences_sum {
    boolean function(int index, int arr[],List<Integer> list, int s, int sum){
          if(index == arr.length){
            if(s == sum){
               System.out.println(list);
               return true;
            }
            return false;
        }
        list.add(arr[index]);
        s+=arr[index];
        if(function(index+1,arr,list,s,sum)){
            return true;
        }
        s-=arr[index];
        list.remove(list.size()-1);
        if(function(index+1,arr,list,s,sum)){
            return true;
        }
        return false;
    }

    public static void main(String []args){
        Scanner in=new Scanner(System.in);
        subsequences_sum obj=new subsequences_sum();
        int arr[]={1,2,1};
        int sum=2;
        obj.function(0,arr,new ArrayList<>(),0,sum);
    }
}
