import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ChatPage } from './chat.page';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarkdownModule.forChild(),
    RouterModule.forChild([
      {
        path: '',
        component: ChatPage
      }
    ])
  ],
  declarations: [ChatPage]
})
export class ChatPageModule {}
