import { useState, useEffect, useContext } from 'react'
import Header from '../../components/Header'
import Title from '../../components/Title'
import { FiPlusCircle } from 'react-icons/fi'
import './new.css'

import { AuthContext } from '../../contexts/auth'
import { db } from '../../services/firebaseConnection'
import { collection, getDocs, getDoc, addDoc, doc, updateDoc } from 'firebase/firestore'

import { useParams, useNavigate, Navigate } from 'react-router-dom'

import { toast } from 'react-toastify'

const listRef = collection(db, "customers")

export default function New(){
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [customers, setCustomers] = useState([])
    const [loadCustomer, setLoadCustomer] = useState(true)
    const [customerSelected, setCustomerSelected] = useState()
    const [complemento, setComplemento] = useState('')
    const [assunto, setAssunto] = useState('Suporte')
    const [status, setStatus] = useState('Aberto')
    const [idCustomer, setIdCustomer] = useState(false)

    useEffect(() => {
        async function loadCustomer(){
            const querySnapshot = await getDocs(listRef)
            .then( (snapshot) => { //Aqui se recebe o resultado de 'getDocs'
                let lista = [];

                snapshot.forEach((doc) => {
                    lista.push({
                       id: doc.id,
                       nomeFantasia: doc.data().nomeFantasia 
                    })
                })

                if(snapshot.docs.size === 0){
                    console.log('NENHUMA EMPRESA ENCONTRADA');
                    setCustomers([ {id: '1', nomeFantasia: 'FREELA' } ])
                    setLoadCustomer(false)
                    return
                }

                setCustomers(lista);
                setLoadCustomer(false);

                if(id){
                    loadId(lista);
                }

            })
            .catch((error) => { 
                console.log('ERRO ao buscar os clientes' , error);
                setLoadCustomer(false);
                setCustomers([{ id: '1', nomeFantasia: 'FREELA'} ])
            })
        }

        loadCustomer();
    }, [id])


    async function loadId(lista){
        const docRef = doc(db, "chamados", id);
        await getDoc(docRef)
        .then((snapshot) => {
            setAssunto(snapshot.data().assunto)
            setStatus(snapshot.data().status)
            setComplemento(snapshot.data().complemento)

            const index = lista.findIndex(item => item.id === snapshot.data().clienteId)
            setCustomerSelected(index)
            setIdCustomer(true);

        })
        .catch((error)=> {
            console.log("Algo deu errado na requisição" + error)
            setIdCustomer(false);
        })
    }
   

    function handleOptionChange(e){
        setStatus(e.target.value);

    }

    function handleChangeSelect(e){
        setAssunto(e.target.value);

    }

    function handleChangeCustomer(e){
        setCustomerSelected(e.target.value);
        
    }

    async function handleRegister(e){
        e.preventDefault();

        //Atualizar um Chamado
        if(idCustomer){
            const docRef = doc(db, "chamados", id)
            await updateDoc(docRef,{
                cliente: customers[customerSelected].nomeFantasia,
                clienteId: customers[customerSelected].id,
                assunto: assunto,
                complemento: complemento,
                status: status,
                userId: user.uid
            })
            .then(() => {
                toast.info("chamado atualizado com Sucesso!")
                setCustomerSelected(0);
                setComplemento('');
                navigate('/dashboard')
            })
            .catch((error) => {
                toast.error("Ops erro ao atualizar esse chamado!")
                console.log(error);
            })

            return
        }


        //Registrar um chamado
        await addDoc(collection(db, "chamados"), {
            created: new Date(),
            cliente: customers[customerSelected].nomeFantasia,
            clienteId: customers[customerSelected].id,
            assunto: assunto,
            complemento: complemento,
            status: status,
            userId: user.uid
        })
        .then(() => {
            toast.success("Chamado Registrado")
            setComplemento('')
            setCustomerSelected(0)
        })
        .catch((error) => {
            toast.error("Ops erro ao Registrar, Tente mais Tarde")
            console.log(error);
        })
        
    }

    return(
        <div>
            <Header/>

            <div className='content'>
                <Title name={id ? "Editando Chamado" : "Novo Chamado"}>
                    <FiPlusCircle size={25}/>
                </Title>

                <div className='container'>
                    <form className='form-profile' onSubmit={handleRegister}>

                        <label>Cliente</label>
                        {
                            loadCustomer ? (
                                <input type='text' disabled={true} value="Carregando..."/>
                            ) : (
                                <select value={customerSelected} onChange={handleChangeCustomer}>
                                    {customers.map((item, index) => {
                                        return(
                                            <option key={index} value={index}>
                                                {item.nomeFantasia}
                                            </option>
                                        )
                                    })}
                                </select>
                            )
                        }

                        <label>Assunto</label>
                        <select value={assunto} onChange={handleChangeSelect}>
                            <option value="Suporte">Suporte</option>
                            <option value="Visita Tecnica">Visita Tecnica</option>
                            <option value="Financeiro">Financeiro</option>
                        </select>

                        <label>Status</label>
                        <div className='status'>
                            <input
                                type='radio'
                                name='radio'
                                value="Aberto"
                                onChange={handleOptionChange}
                                checked={status === 'Aberto'}
                            />
                            <span>Em aberto</span>

                            <input
                                type='radio'
                                name='radio'
                                value="Progresso"
                                onChange={handleOptionChange}
                                checked={status === 'Progresso'}
                            />
                            <span>Progresso</span>
                            <input
                                type='radio'
                                name='radio'
                                value="Atendido"
                                onChange={handleOptionChange}
                                checked={status === 'Atendido'}
                            />
                            <span>Atendido</span>
                        </div>
                        <label>Complemento</label>
                        <textarea 
                            type="text"
                            placeholder='Descreva seu problema (opcional)'
                            value={complemento}
                            onChange={(e) => setComplemento(e.target.value)}
                        />

                        {idCustomer ? (
                            <button type='submit'>Atualizar</button>
                        ) : (
                            <button type='submit'>Registrar</button>
                        )}

                    </form>
                </div>

            </div>
        </div>
    )

}