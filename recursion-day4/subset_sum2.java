import java.util.*;
public class subset_sum2 {
    void function(int index, int[] nums,List<List<Integer>> ans, List<Integer> ds){
      ans.add(new ArrayList<>(ds));
      for(int i=index;i<nums.length;i++){
        if(i!=index && nums[i] == nums[i-1]) continue;
        ds.add(nums[i]);
        function(i+1,nums, ans,ds);
        ds.remove(ds.size()-1);
      }
    }
    public List<List<Integer>> subsetsum(int nums[]){
        Arrays.sort(nums);
        List<List<Integer>> ans=new ArrayList<>();
        function(0,nums,ans,new ArrayList<>());
        return ans;
    }
    public static void main(String[] args){
        int nums[] = {1,2,2,2,3,3};
        subset_sum2 obj=new subset_sum2();
        System.out.println(obj.subsetsum(nums));
    }
}
