import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AlertController, LoadingController } from "@ionic/angular";
import { ChatService } from "src/app/services/chat.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.page.html",
  styleUrls: ["./login.page.scss"],
})
export class LoginPage implements OnInit {
  credentialForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private chatService: ChatService
  ) {}

  ngOnInit(): void {
    this.credentialForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  async signUp() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.chatService.signUp(this.credentialForm.value).then(
      (user) => {
        loading.dismiss();
        this.router.navigateByUrl("/chat", { replaceUrl: true });
      },
      async (err) => {
        loading.dismiss();
        const alert = await this.alertController.create({
          header: "Sign up failed",
          message: err.message,
          buttons: ["OK"],
        });

        await alert.present();
      }
    );
  }

  async signIn() {
    const loading = await this.loadingController.create();
    await loading.present();

    this.chatService.signIn(this.credentialForm.value).then(
      (res) => {
        loading.dismiss();
        this.router.navigateByUrl("/chat", { replaceUrl: true });
      },
      async (err) => {
        loading.dismiss();
        const alert = await this.alertController.create({
          header: ":(",
          message: err.message,
          buttons: ["OK"],
        });

        await alert.present();
      }
    );
  }
  // easy access to form fields with getter functions
  get email() {
    return this.credentialForm.get("email");
  }

  get password() {
    return this.credentialForm.get("password");
  }
}
