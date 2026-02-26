import java.util.*;
public class QuickSort {
    void QuickSort(int []arr, int low, int high){
        if(low>=high){
            return;
        }
        int partition= function(arr,low,high);
        QuickSort(arr, low ,partition-1);
        QuickSort(arr, partition+1,high);
    }

    int function(int arr[], int low, int high){
       int pivot=arr[low];
       int i= low;
       int j= high;
       while(i<j){
        while(arr[i] <= pivot && i<= high){
            i++;
        }
        while(arr[j] > pivot && j>=low ){
            j--;
        }
        if(i<j){
          
            int temp=arr[i];
            arr[i]=arr[j];
            arr[j]=temp;
        }
    }
          int temp=arr[low];
            arr[low]=arr[j];
            arr[j]=temp;
        
       return j;
    }
     public static void main(String [] args){
        Scanner in=new Scanner(System.in);
        QuickSort obj=new QuickSort();
        int arr[]={3,2,1,4,3};
        obj.QuickSort(arr,0,arr.length-1);
        System.out.println(Arrays.toString(arr));
    }

}
