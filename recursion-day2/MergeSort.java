import java.util.*;
class MergeSort{
    void MergeSort(int[] arr, int low, int high){
        if(low>=high){
            return;
        }
        int mid=(low+high)/2;
        MergeSort(arr, low, mid);
        MergeSort(arr, mid+1, high);
        Merge(arr, low, mid, high);
    }

    void Merge(int[]arr, int low,int mid, int high){
      List<Integer> list =new ArrayList<>();
            int left=low;
      int right=mid+1;
      while(left <= mid && right <= high){
        if( arr[left] <= arr[right]){
            list.add(arr[left]);
            left++;
        }
        else{
            list.add(arr[right]);
            right++;
        }
      }
    
      while(left <= mid){
        list.add(arr[left]);
        left++;
      }
      while(right <= high){
        list.add(arr[right]);
        right++;
      }
      for(int i=low;i<=high;i++){
        arr[i]=list.get(i-low);
      }

    }

    public static void main(String [] args){
        Scanner in=new Scanner(System.in);
        MergeSort obj=new MergeSort();
        int arr[]={3,2,1,4,3};
        obj.MergeSort(arr,0,arr.length-1);
        System.out.println(Arrays.toString(arr));
    }
}