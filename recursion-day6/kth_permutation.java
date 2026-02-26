import java.util.*;
public class kth_permutation {
    String function(int n, int k){
        int fact=1;
        List<Integer> numbers=new ArrayList<>();
        for(int i=1;i<n;i++){
            fact=fact*i;
            numbers.add(i);
        }
        numbers.add(n);
        String ans ="";
        k=k-1;
        while(true){
            ans=ans+numbers.get(k/fact);
            numbers.remove(k/fact);
            if(numbers.size()==0){
                break;
            }
            k=k%fact;
            fact= fact/numbers.size();
        }
        return ans;
    }

    public static void main(String[] args){
        kth_permutation obj=new kth_permutation();
        int n=4;
        int k=17;
        System.out.println(obj.function(n,k));
    }
}
