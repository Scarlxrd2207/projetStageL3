import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheat, Building2, ShoppingCart, Package, MessageSquare, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { login } from '../../services/auth.service';
import { enregistrerSession } from '../../utils/session';
import '../../styles/tiroir.css';

export default function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [voir, setVoir] = useState(false);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    try {
      const u = await login(email.trim(), motDePasse);
      enregistrerSession({
        idUser: u.idUser,
        email: u.email,
        role: u.role as 'RESPONSABLE' | 'PRESIDENT',
        idCoop: u.idCoop,
        nomCoop: u.nomCoop,
      });
      navigate(u.role === 'RESPONSABLE' ? '/dashboard/responsable' : '/dashboard/president');
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Serveur inaccessible, vérifiez que le backend est lancé');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="login-fond">
      <div className="login-carte">
        <section className="login-visuel">
          <div>
            <Wheat size={44} />
            <h2>SOAM</h2>
            <p>Achats et livraisons des coopératives de base : commandes, stock, paiements et messages, en temps réel.</p>
          </div>
          <div className="login-icones">
            <div><Building2 size={20} /> Coopératives</div>
            <div><ShoppingCart size={20} /> Commandes</div>
            <div><Package size={20} /> Stock</div>
            <div><MessageSquare size={20} /> Messages</div>
          </div>
        </section>

        <section className="login-form">
          <h1>Connexion</h1>
          <p className="sous-titre">Connectez-vous à votre espace.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="champ">
              <span className="ico"><Mail size={18} /></span>
              <input type="email" placeholder="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>

            <div className="champ">
              <span className="ico"><Lock size={18} /></span>
              <input
                type={voir ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="current-password"
              />
              <button type="button" className="oeil" aria-label="Afficher ou masquer le mot de passe" onClick={() => setVoir((v) => !v)}>
                {voir ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" className="bouton-principal" disabled={envoi || !email || !motDePasse}>
              <LogIn size={18} />
              {envoi ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>

          {erreur && (
            <div className="erreur-login">
              <AlertCircle size={18} />
              {erreur}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}