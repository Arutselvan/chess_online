import { Component } from '@angular/core';
import { LoginComponent } from './login/login.component';
import { NavBarComponent } from './nav-bar/nav-bar.component'
import { Message } from './class_defs/message_item'
import { SocketService } from './socket.service'
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  socket;
  title = 'app';
  player:string = "";
  messages: Message[];
  ngOnInit(): void{  
    this.getMessages();
  }
  constructor(private socketService: SocketService){
  }
  
sendMessageTemp(){
    console.log("sending temp message");
    //this.socketService.sendUsername();
    this.socketService.sendMessages();
  }
 clearMessages():void{
   console.log("clearing temp message");
   this.socketService.clearMessages();
   this.messages = []
 }
 getMessages():void{
   console.log("getting messages")
   this.socketService.getMessages()
      .subscribe(messages => this.messages = messages);
 }
}
