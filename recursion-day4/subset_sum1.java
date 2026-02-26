import java.util.*;

class subset_sum1 {

    void function(int index, int sum, int n, ArrayList<Integer> arr, ArrayList<Integer> sumSubset){

        if(index == n){
            sumSubset.add(sum);
            return;
        }

        function(index+1, sum + arr.get(index), n, arr, sumSubset);
        function(index+1, sum, n, arr, sumSubset);
    }

    ArrayList<Integer> subsetSum(ArrayList<Integer> arr, int n){

        ArrayList<Integer> sumSubset = new ArrayList<>();

        function(0, 0, n, arr, sumSubset);

        Collections.sort(sumSubset);

        return sumSubset;
    }

    public static void main(String[] args){

        ArrayList<Integer> arr = new ArrayList<>(Arrays.asList(1,2,3));

        subset_sum1 obj = new subset_sum1();

        System.out.println(obj.subsetSum(arr, arr.size()));
    }
}