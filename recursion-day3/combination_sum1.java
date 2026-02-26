
import java.util.*;
public class combination_sum1 {
   static void function(int index, int target,int arr[],List<List<Integer>> ans, List<Integer> list){
       if(index==arr.length){
         if(target==0){
           ans.add(new ArrayList<>(list));
         }
         return;
       }
       if(arr[index] <= target){
        list.add(arr[index]);
        function(index, target-arr[index],arr,ans,list);
        list.remove(list.size()-1);
       }
       function(index+1, target, arr, ans, list);
   }

   public List<List<Integer>> combinations(int [] candidates, int target){
    Scanner in=new Scanner(System.in);
    List<List<Integer>> ans = new ArrayList<>();
    function(0,target,candidates,ans,new ArrayList<>());
    return ans;
   }

    public static void main(String[] args){

        int[] candidates = {2,3,6,7};
        int target = 7;

        List<List<Integer>> ans = new ArrayList<>();

        function(0, target, candidates, ans, new ArrayList<>());

        System.out.println(ans);
    }
}
