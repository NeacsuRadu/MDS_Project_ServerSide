
import javafx.fxml.FXML;
import javafx.scene.control.Label;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class PopupController 
{
    @FXML Label textLabel;
    
    public void setLabelText(String message)
    {
        textLabel.setText(message);
    }
    
}