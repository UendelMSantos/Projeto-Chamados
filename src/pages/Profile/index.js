import { useContext, useState } from "react";
import Header from "../../components/Header";
import Title from "../../components/Title";

import avatar from '../../assets/avatar.png'
import { FiSettings, FiUpload } from "react-icons/fi";
import { AuthContext } from "../../contexts/auth";

import {db, storage} from '../../services/firebaseConnection';
import {doc, updateDoc} from 'firebase/firestore'
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage'


import { toast } from "react-toastify";

import './profile.css'

export default function Profile(){

    const { user, storageUser, setUser, logout } = useContext(AuthContext);

    const [avatarUrl, setAvatarUrl] = useState(user && user.avatarUrl)
    const [nome, setNome] = useState(user && user.nome)
    const [email, setEmail] = useState(user && user.email)
    const [imageAvatar, setImageAvatar] = useState(null)

    function handleFile(e){
        console.log(e.target.files);
        if(e.target.files[0]){
            const image = e.target.files[0];

            if(image.type === 'image/jpeg' || image.type === 'image/png'){
                setImageAvatar(image)
                setAvatarUrl(URL.createObjectURL(image))
            }else{
                alert("Envie uma imagem do tipo PNG ou JPEG")
                setImageAvatar(null);
                return;

            }
        }
    }


    async function handleUpload() {
        const currentUid = user.uid;

        const uploadRef = ref(storage, `imagens/${currentUid}/${imageAvatar.name}`)

        const uploadTask = uploadBytes(uploadRef, imageAvatar)
        .then( (snapshot) => {
            getDownloadURL(snapshot.ref).then( async (downLoadURL) => {
                let urlFoto = downLoadURL;

                const docRef = doc(db, 'users', user.uid)
                await updateDoc(docRef, {
                    avatarUrl: urlFoto,
                    nome:nome,
                })
                .then(() => {
                    let data = {
                        ...user,
                        nome:nome,
                        avatarUrl: urlFoto,
                    }

                    setUser(data);
                    storageUser(data);
                    toast.success("Atualizado com Sucesso!")

                })

            })
        })
    }


    async function handleSubmit(e){
        e.preventDefault();

        if(imageAvatar === null && nome !== ''){
            //Atualizar o nome de Usuário
            const docRef = doc(db, "users", user.uid)
            await updateDoc(docRef, {
                nome: nome,
            })
            .then(() => {
                let data = {
                    ...user,
                    nome: nome,
                }
                setUser(data);
                storageUser(data);
                toast.success("Nome Atualizado com Sucesso")
            })
        }else if(nome !== '' && imageAvatar !== null){
            //Atualiar Foto e Nome
            handleUpload()
        }

    }



    return(
        <div>
            <Header/>

            <div className="content">
                <Title name="Minha Conta">
                    <FiSettings size={25}/>
                </Title>


                <div className="container">


                    <form className="form-profile" onSubmit={handleSubmit}>

                        <label className="label-avatar">
                                <span>
                                    <FiUpload color="#FFF" size={25} />
                                </span> 

                                <input type="file" accept="image/*" onChange={handleFile} /> <br/>
                                {avatarUrl === null ? (
                                    <img src={ avatar } alt="Foto de Perfil" width={250} height={250} />
                                )   :  (
                                    <img src={avatarUrl} alt="Foto de perfil" width={250} height={250} />
                                )}
                        
                        </label> 


                        <label>Nome</label>
                        <input type="texte" value={nome} onChange={(e) => setNome(e.target.value)}/>

                        <label>Email</label>
                        <input type="texte" value={email} disabled={true} />                                    
                                    
                        <button type="submit" >Salvar</button>            
                        
                    </form>

                </div>

                <div className="container">
                    <button className="logout-btn" onClick={() => logout()}>Sair</button>
                </div>


            </div>

        </div>
    )
}