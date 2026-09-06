/**
 * Chave pública VAPID do Web Push, gerada no console do Firebase.
 * É pública por natureza — vai no bundle do cliente sem problema.
 */
export const VAPID_KEY =
    "BGeI6s7VOvVBacd89Wci9AywylxfqliBXww0GE3JM4UeT5N9eNVQgFYy2xWA1qL1VV7PiESh7LJgDM_oq7I4ffc";

/**
 * Configuração do app web no Firebase. Cole aqui o objeto que aparece em
 * Configurações do projeto → Seus apps → SDK setup. Nenhum destes campos é
 * segredo: eles identificam o projeto, não autorizam envio.
 * A chave privada do VAPID e o service account ficam SÓ no servidor.
 */
export const FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    messagingSenderId: "",
    appId: "",
};

export function isPushConfigured(): boolean {
    return Boolean(
        FIREBASE_CONFIG.apiKey &&
            FIREBASE_CONFIG.messagingSenderId &&
            FIREBASE_CONFIG.appId &&
            FIREBASE_CONFIG.projectId,
    );
}
