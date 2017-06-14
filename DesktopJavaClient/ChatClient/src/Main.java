/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Modality;
import javafx.stage.Stage;
import org.json.JSONObject;

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class Main extends Application implements MainController
{
    private Stage primaryStage;
    
    private FXMLLoader signInLoader;
    private FXMLLoader registerLoader;
    private FXMLLoader mainLoader;
    
    private Scene signInScene;
    private Scene registerScene;
    private Scene mainScene;
    
    private SignInController signInController;
    private RegisterController registerController;
    private AppController appController;
    
    private ClientSocket clientSocket = null;
    
    private boolean signedIn = false;
    
    private HashMap<String, ChatWindow> windowsMap;
    
    @Override
    public void start(Stage stage) throws Exception 
    {
        primaryStage = stage;      
        if (!initialize())
        {
            System.out.println("Error");
            return;
        }
        showSignInView();
    }
    
    @Override 
    public void stop()
    {
        if (signedIn == true)
        {
            sendMessage(MessageHandler.getInstance().getLogOutMessage(appController.getUsername()));
            closeWindows();
        }
        clientSocket.close();
    }
    
    @Override
    public void closeWindows()
    {
        for (String key : windowsMap.keySet())
        {
            ChatWindow window = windowsMap.get(key);
            if (window != null)
            {
                window.close();
            }
        }
    }
    
    public synchronized Stage getStage()
    {
        return this.primaryStage;
    }
    
    public synchronized void showMessage(String username_from, String message)
    {
        if (openWindowOrSetFocus(username_from) == false)
        {
            windowsMap.get(username_from).getController().showMessage(message);
        }
    }
    
    
    boolean initialize()
    {
        boolean bRes = true;
        
        windowsMap = new HashMap();
        MessageHandler.getInstance().addHandler(this);
        
        signInLoader = new FXMLLoader();
        registerLoader = new FXMLLoader();
        mainLoader = new FXMLLoader();

        signInLoader.setLocation(Main.class.getResource("SignInView.fxml"));
        registerLoader.setLocation(Main.class.getResource("RegisterView.fxml"));
        mainLoader.setLocation(Main.class.getResource("MainView.fxml"));
        
        JSONObject ob = new JSONObject();
        try
        {
            signInLoader = new FXMLLoader();
            registerLoader = new FXMLLoader();
            mainLoader = new FXMLLoader();

            signInLoader.setLocation(Main.class.getResource("SignInView.fxml"));
            registerLoader.setLocation(Main.class.getResource("RegisterView.fxml"));
            mainLoader.setLocation(Main.class.getResource("MainView.fxml"));
        
            Parent rootSignIn = signInLoader.load();
            Parent rootRegister = registerLoader.load();
            Parent rootMain = mainLoader.load();
            
            signInScene = new Scene(rootSignIn);
            registerScene = new Scene(rootRegister);
            mainScene = new Scene(rootMain);

            signInController = signInLoader.getController();
            registerController = registerLoader.getController();
            appController = mainLoader.getController();

            signInController.setMainController(this);
            registerController.setMainController(this);
            appController.setMainController(this);
            
        }
        catch(IOException ex)
        {
            System.out.println("Initialize error " + ex.getMessage());
            bRes = false;
        }     
        
        this.clientSocket = new ClientSocket();
        if (!clientSocket.init())
        {
            clientSocket = null;
            System.out.println("Could not initialize socket");
        }
        else 
        {
            clientSocket.startListening();
        }
        return bRes;
    }
    
    /**
     * @param args the command line arguments
     */
    public static void main(String[] args) 
    {
        launch(args);
    }
    
    public void showPopup(String username)
    {
        try
        {
            FXMLLoader loader = new FXMLLoader();
            loader.setLocation(Main.class.getResource("PopupView.fxml"));
            Parent root = loader.load();
            PopupController controller = loader.getController();
            controller.setLabelText(username);
            
            Scene scene = new Scene(root);
            Stage stage = new Stage();
            stage.setTitle("Info");
            stage.initModality(Modality.WINDOW_MODAL);
            stage.initOwner(primaryStage);
            stage.setScene(scene);
            stage.show();

        }
        catch(IOException ex)
        {
            System.out.println("Cannot show the popup");
        }
        
    }
    
    // ------ MAIN CONTROLLER IMPLEMENTATION ------ //
    
    @Override
    public String getUsername()
    {
        return appController.getUsername();
    }
    
    @Override
    public void removeWindow(String username)
    {
        if (windowsMap.containsKey(username))
        {
            windowsMap.remove(username);
        }
    }
    
    @Override 
    public boolean openWindowOrSetFocus(String username)
    {
        if (windowsMap.containsKey(username) == false)
        {
            ChatWindow window = new ChatWindow(username, this);
            if (window.createWindow() == true)
            {
                windowsMap.put(username, window);
            }
            sendMessage(MessageHandler.getInstance().getRequestConversationMessage( appController.getUsername(), username));
            return true;
        }
        else 
        {
            ChatWindow window = windowsMap.get(username);
            window.requestFocus();
            return false;
        }
    }
    
    @Override 
    public void showSignInView()
    {
        this.primaryStage.setScene(signInScene);
        this.signInController.initView();
        this.primaryStage.show();
    }
    
    @Override
    public void showRegisterView()
    {
        this.primaryStage.setScene(registerScene);
        this.registerController.initView();
        this.primaryStage.show();
    }
    
    @Override
    public void showAppView()
    {
        this.primaryStage.setScene(mainScene);
        this.appController.initView();
        this.primaryStage.show();
    }
    
    @Override
    public void sendMessage(String message)
    {
        if (clientSocket != null)
        {
            clientSocket.sendMessage(message);
        }
    }
    
    @Override
    public void signInFailed()
    {
        Platform.runLater(()->
        {
            signInController.showSignInFailedError();
        });
    }
    
    @Override
    public void signInSucceded(UserData userData, ArrayList<Friend> userFriends, ArrayList<String> friendRequests)
    {
        Platform.runLater(()->
        {
            signedIn = true;
            appController.signInSucceeded(userData, userFriends, friendRequests);
            showAppView();
        });
    }
    
    @Override
    public void logedOut()
    {
        closeWindows();
        signedIn = false;
    }
    
    @Override
    public void registerFailed()
    {
        Platform.runLater(()->
        {
            registerController.showRegistrationFailedError();
        });
    }
    
    @Override
    public void registerSucceded()
    {
        Platform.runLater(()->
        {
            showSignInView();
        });
    }
    
    @Override
    public void updateFriends(String username, boolean online)
    {
        Platform.runLater(()->
        {
            appController.updateFriends(username, online);
        });
    }
    
    @Override
    public void addFriendRequest(String username)
    {
        Platform.runLater(()->
        {
            appController.addFriendRequest(username);
        });
    }
    
    @Override 
    public void friendRequestFailed()
    {
        Platform.runLater(()->
        {
            appController.friendRequestFailed();
        });
    }
    
    @Override
    public void updateConversation(String username, ArrayList<Message> ar)
    {
        Platform.runLater(()->
        {
            if (windowsMap.containsKey(username))
            {
                windowsMap.get(username).getController().updateConversation(ar);
            }
        });
    }
    
    @Override
    public void showFriendRequestDeclinedPopup(String username)
    {
        Platform.runLater(()->
        {
            showPopup(username);
        });
    }
    
    @Override
    public void messageReceived(String username_from, String message)
    {
        Platform.runLater(()->
        {
            showMessage(username_from, message);
        }); 
    }
}
