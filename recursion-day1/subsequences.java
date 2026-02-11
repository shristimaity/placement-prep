import java.util.*;
public class subsequences {
    void function(int index,int []arr, List<Integer> list){
     if(index>=arr.length){
        System.out.println(list);
        return;
     }
     list.add(arr[index]);
     function(index+1, arr,list);
     list.remove(list.size() - 1);
     function(index+1, arr,list);
    }
    public static void main(String[] args) {

        subsequences obj = new subsequences();
        int[] arr = {1, 2, 3};

        obj.function(0, arr, new ArrayList<>());
    }
}
