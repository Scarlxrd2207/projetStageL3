import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';
<main style={{ maxWidth: 360, margin: '60px auto', padding: 24, background: 'white', borderRadius: 8 }}></main>

export default function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');

    try {
      const utilisateur = await login(email, motDePasse);
      localStorage.setItem('utilisateur', JSON.stringify(utilisateur));

      if (utilisateur.role === 'RESPONSABLE') navigate('/dashboard/responsable');
      else navigate('/dashboard/president');
    } catch (err: any) {
      setErreur(err.response?.data?.message ?? 'Serveur inaccessible');
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'Arial' }}>
      <h1>Connexion SOAM</h1>

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 12 }}
        />

        <label>Mot de passe</label>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 12 }}
        />

        <button type="submit" style={{ width: '100%', padding: 8 }}>
          Se connecter
        </button>
      </form>

      {erreur && <p style={{ color: 'red' }}>{erreur}</p>}
    </main>
  );
}