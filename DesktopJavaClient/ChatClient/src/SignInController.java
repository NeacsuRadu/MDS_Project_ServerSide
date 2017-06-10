
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
            int passwordEnc = passwordEncryption(password);
            mainController.sendMessage(MessageHandler.getInstance().getSignInMessage(username, passwordEnc));
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
    
    private int passwordEncryption(String password)
    {
        int hash = 0;
        char chr;
        if (password.length() == 0) 
        {
            return hash;
        }
        for (int i = 0; i < password.length(); i++) 
        {
          chr = password.charAt(i);
          hash  = ((hash << 5) - hash) + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
    
}
