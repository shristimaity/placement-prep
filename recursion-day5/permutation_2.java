import java.util.*;
   public class permutation_2 {
    void function(int index, int[] arr, List<List<Integer>> ans){
     if(index==arr.length){
      List<Integer> ds=new ArrayList<>();
      for(int i=0;i<arr.length;i++){
        ds.add(arr[i]);
      }
      ans.add(new ArrayList<>(ds));
      return;
     }
     for(int i=index;i<arr.length;i++){
        swap(i,index,arr);
        function(index+1,arr,ans);
        swap(i,index,arr);
     }
    }

    void swap(int i,int j,int arr[]){
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    public List<List<Integer>> permute(int arr[]){
        List<List<Integer>> ans = new ArrayList<>();
        function(0,arr,ans);
        return ans;
    }
   
    public static void main(String[] args){
        int arr[]={1,2,3};
        permutation_2 obj=new permutation_2();
        System.out.println(obj.permute(arr));
    }


}
