
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;

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
    
    @FXML
    private TextField registerFirstName, registerLastName, registerUsername;
    @FXML
    private PasswordField registerPassword, registerRePassword;
    @FXML
    private Label registerErrors;
    
    public void registerPressRegister(ActionEvent e){
        
        String firstName = new String(registerFirstName.getText());
        String lastName = new String(registerLastName.getText());
        String username = new String(registerUsername.getText());
        String password = new String(registerPassword.getText());
        String rePassword = new String(registerRePassword.getText());
        
        if(firstName.equals("") || lastName.equals("") || username.equals("")
                || password.equals("") || rePassword.equals("") ||
                !password.equals(rePassword)){
            showRegistrationFailedError();
        }
        else{
            mainController.sendMessage(MessageHandler.getInstance().getRegisterMessage(firstName, lastName, username, password));
        }
    }
    
    public void registerPressSignIn(ActionEvent e){
        mainController.showSignInView();
    }
    
    public void setMainController(MainController controller)
    {
        this.mainController = controller;
    }
    
    public void initView()
    {
        registerFirstName.setText("");
        registerLastName.setText("");
        registerUsername.setText("");
        registerPassword.setText("");
        registerRePassword.setText("");
        registerErrors.setText("");
        // aici facem toate labelurile de eroare invizibile 
        // si scoatem textul din textfiled-uri :) 
        // o apelam inainte sa afisam view-ul 
        
    }
    
    public void showRegistrationFailedError()
    {
        registerErrors.setText("Register error! Please retype different informations!");
    }
    
}
