import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserResponse } from '../models';

// Declare Keycloak as a global (loaded via angular.json scripts)aasdasd
declare const Keycloak: any;

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private keycloak: any;

    constructor() {
        this.keycloak = new Keycloak({
            url: 'https://keycloak-bbitai-dev.apps.rm3.7wse.p1.openshiftapps.com',
            realm: 'photo',
            clientId: 'ui'
        });

        // Additional configuration for Keycloak endpoints
        this.keycloak.tokenUri = 'https://keycloak-bbitai-dev.apps.rm3.7wse.p1.openshiftapps.com/realms/photo/protocol/openid-connect/token';
        this.keycloak.userInfoUri = 'https://keycloak-bbitai-dev.apps.rm3.7wse.p1.openshiftapps.com/realms/photo/protocol/openid-connect/userinfo';
        this.keycloak.jwkSetUri = 'https://keycloak-bbitai-dev.apps.rm3.7wse.p1.openshiftapps.com/realms/photo/protocol/openid-connect/certs';
        this.keycloak.authorizationUri = 'https://keycloak-bbitai-dev.apps.rm3.7wse.p1.openshiftapps.com/realms/photo/protocol/openid-connect/auth';
        this.keycloak.issuerUri = 'https://keycloak-bbitai-dev.apps.rm3.7wse.p1.openshiftapps.com/realms/photo';
        this.keycloak.userNameAttribute = 'preferred_username';

        this.keycloak.onAuthLogout = () => {
            console.log('Logout esemény történt');
            localStorage.removeItem('jwt');
        };
    }

    /**
     * Called once at app startup via APP_INITIALIZER.
     * On first visit (no auth code): check-sso detects no session, user is not logged in.
     * After redirect back from Keycloak: check-sso processes the auth response and retrieves the token.
     */
    init(): Promise<boolean> {
        return this.keycloak.init({
            onLoad: 'login-required',
            scope: 'openid profile email roles',
            redirectUri: 'https://felho-lab-ui-git7-bbitai-dev.apps.rm3.7wse.p1.openshiftapps.com/ui/',
        }).then((authenticated: boolean) => {
            if (authenticated) {
                console.log('Authenticated!');
                console.log('JWT:', this.keycloak.token);
                localStorage.setItem('jwt', this.keycloak.token);
            } else {
                console.log('Not authenticated');
            }
            return authenticated;
        }).catch((err: any) => {
            console.error('Keycloak init failed', err);
            return false;
        });
    }

    /** Triggers redirect to Keycloak login page. */
    login(): void {
        this.keycloak.login({
            redirectUri: window.location.origin,
            scope: 'openid profile email roles',
        });
    }

    logout(): void {
        localStorage.removeItem('jwt');
        this.keycloak.logout({
            redirectUri: 'https://felho-lab-ui-git7-bbitai-dev.apps.rm3.7wse.p1.openshiftapps.com/ui/',
        });
    }

    register(): void {
        this.keycloak.register({
            redirectUri: 'https://felho-lab-ui-git7-bbitai-dev.apps.rm3.7wse.p1.openshiftapps.com/ui/',
        });
    }

    getToken(): string | null {
        return this.keycloak.token ?? localStorage.getItem('jwt');
    }
}
