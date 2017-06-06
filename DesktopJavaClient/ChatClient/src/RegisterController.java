/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class RegisterController 
{
    private MainController mainController = null;
    
    public void setMainController(MainController controller)
    {
        this.mainController = controller;
    }
    
    public void initView()
    {
        // aici facem toate labelurile de eroare invizibile 
        // si scoatem textul din textfiled-uri :) 
        // o apelam inainte sa afisam view-ul 
        
    }
    
    public void showRegistrationFailedError()
    {
        
    }
}
