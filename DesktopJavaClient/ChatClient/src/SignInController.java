
import javafx.event.ActionEvent;
import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.stage.Window;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class SignInController 
{
    private MainController mainController = null;
    
    @FXML
    private TextField signInUsername;
    @FXML
    private PasswordField signInPassword;
    @FXML
    private Label signInErrors, signInConnectionErrors;
    
    public void singInPressSingIn(ActionEvent e)
    {
        
        String username = new String(signInUsername.getText());
        String password = new String(signInPassword.getText());
        
        if(username.equals("") || password.equals(""))
        {
            showSignInFailedError();
        }
        else
        {
            mainController.sendMessage(MessageHandler.getInstance().getSignInMessage(username, password));
        }
    }
    
    
    public void singInPressRegister(ActionEvent e)
    {
        mainController.showRegisterView();
    }
    
    public void setMainController(MainController controller)
    {
        this.mainController = controller;
    }
    
    public void initView()
    {   
        signInUsername.setText("");
        signInPassword.setText("");
        signInErrors.setText("");
        signInConnectionErrors.setText("");
    }
    
    public void showSignInFailedError()
    {
        signInErrors.setText("Username or password is incorrect!");
    }
    
}
