import axios from 'axios';

export async function getHTML(url: string): Promise <string | null>{
    try{
        const TimeStart = new Date().getTime();
        const response = await axios.get(url);
        if (response.status === 200){
            const elapsed_Time = new Date().getTime() - TimeStart
            console.log("Elapsed: " + elapsed_Time + "ms" + "\n")
            return response.data;}
        else {
            console.error(`Ошибка при запросе: ${response.status}`);
            return null;
        }}    
        catch (error) {
            console.error(`Ошибка при получении HTML: ${error}`);
            return null;
          }        
}
