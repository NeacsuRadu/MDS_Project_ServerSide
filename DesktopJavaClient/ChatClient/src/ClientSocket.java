
import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.Scanner;

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Radu-Stefan Neacsu
 */
public class ClientSocket 
{
    private Socket socket = null;
    private MessageListener messageListener = null;
    private PrintWriter printWriter = null;
    
    public ClientSocket()
    {
        
    }
    
    public void startListening()
    {
        messageListener.start();
    }
    
    public void close()
    {
        try
        {
            socket.close();
        }
        catch(IOException ex)
        {
            System.out.println("Could not close the socket");
        }
    }
    
    public boolean init()
    {
        boolean bRes = true;
        
        try
        {
            socket = new Socket("127.0.0.1", 43210);
            printWriter = new PrintWriter(socket.getOutputStream(), true);
            messageListener = new MessageListener(new Scanner(socket.getInputStream()));
        }
        catch(UnknownHostException ex) 
        {
            System.out.println("ClientSocket init: " + ex.getMessage());
            bRes = false;
        }
        catch(IOException ex)
        {
            System.out.println("ClientSocket init: " + ex.getMessage());
            bRes = false;
        }
        
        return bRes;
    }
    
    public synchronized void sendMessage(String message)
    {
        printWriter.println(message);
    }
}
