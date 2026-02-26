import java.util.*;
class permutation_1{
    void permutation(int arr[], List<Integer> ds,List<List<Integer>> ans,boolean [] freq){
        if(ds.size()==arr.length){
            ans.add(new ArrayList<>(ds));
            return;
        }

        for(int i=0;i<arr.length;i++){
            if(!freq[i]){
                freq[i]=true;
                ds.add(arr[i]);
                permutation(arr, ds, ans, freq);
                ds.remove(ds.size()-1);
                freq[i]=false;
            }
        }
    }
    public List<List<Integer>> permute(int[] nums){
        List<List<Integer>> ans=new ArrayList<>();
        List<Integer> ds=new ArrayList<>();
        boolean freq[]=new boolean [nums.length];
        permutation(nums,ds,ans,freq);
        return ans;
    }

    public static void main(String[] args){
    int nums[] ={1,2,3};
    permutation_1 obj=new permutation_1();
    System.out.println(obj.permute(nums));
    }
}