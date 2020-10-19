"use strict";
const instance = axios.create({
  baseURL: 'http://l.iqtics.mx/api',
  timeout: 2000,
  headers: {

  }
});
const apiUrl = "http://l.iqtics.mx/api";
//http://l.iqtics.mx/api/opcionesMenu/categoriaMenu/categoriaCliente
// const apiUrl = () => {
//   const [url,protocl,hostname,path] = /^(\w+):\/\/([^\/]+)([^]+)$/.exec(window.location.href);
//   return `${protocl}://${hostname}/api`;
// };

const formCliente = "ClienteForm";
const currentClietnForm = "CurrentClientForm";
const inputSearch = "input-search";
const idTabla = "#tabla-clientes";

let table;
let modal;
let clientes = [];
let categorias = [];
let precios = [];

let onClickedRow = false;
let currentSelectClient;

document.addEventListener("DOMContentLoaded", Ready);

async function Ready() {
  clientes = await getClientes() || [];
  categorias = await getCategorias() || [];
  precios = await getPrecios() || [];

  categorias.forEach(c => document.querySelector("#opCategorias").appendChild(createOption(c.id,c.nombre)));

  precios.forEach(p => document.querySelector("#opPrecios").appendChild(createOption(p.id,p.nombre)));


  let configTable = {
    searching: false,
    paging: false,
    bInfo: false,
    bScrollInfinite: true,
    bScrollCollapse: true,
    ordering: false,
    sScrollY: "300px",
    data: transformarInformacion(clientes),
    columns: [
      {
        data: "representante",
      },
      {
        data: "razonSocial",
      },
      {
        data: "acciones",
      },
    ],
    createdRow: function (row, data, dataIndex) {
      $(row).attr("id", data.id);
      row.addEventListener("click", selectRow);
    },
  };

  table = createTable(idTabla, configTable);
  loadButtons();
  
  modal = $("#FormModal");
  // modal.on("show.bs.modal", () => console.log("ssss"));
  modal.on("hidden.bs.modal", () => resetForm(formCliente));


  document.getElementById(formCliente).addEventListener("submit",onSubmit);
  document.getElementById(inputSearch).addEventListener("keyup",(e) => {
    const text = e.target.value;
    table.search(text).draw();
    // const clientesFiltrados = clientes.filter(c => filtrarClientes(c,text));

    // resetForm(currentClietnForm);
    // reloadTable(table,transformarInformacion(clientesFiltrados));
  });
  document.getElementById("btn-export").addEventListener("click",exportXls);
}

async function getClientes() {
  try{
    const response = await instance.get(`/clientes`);
    return response.data;
  }catch(error){
    console.error(error);
    return [];
  }
}

async function addCliente(newCliente){
  if(newCliente instanceof FormData){
    const response = await instance.post('/clientes',newCliente,{headers:{
      "Content-Type":"application/json"
    }});
    console.log(response);
  }
  
  // const result = await HttpClient.post(`${apiUrl}/clientes`,newCliente);
  // if(result !== undefined && result !== null ){
  //   window.location.reload();
  // }
}

async function editClient(id,cliente){
  const result = await HttpClient.put(`${apiUrl}/clientes/${id}`,cliente);
  window.location.reload();
}

async function deleteCliente(idCliente){
  const result = await HttpClient.delete(`${apiUrl}/clientes/${idCliente}`);
  clientes.splice(findClientIndex(idCliente),1);
  reloadTable(table,transformarInformacion(clientes));
}

async function exportXls(e){
  const result = await HttpClient.get(`${apiUrl}/clientes/export`);
  if(result === undefined){
    alert("Error al exportar");
    return;
  }
  const url = window.URL.createObjectURL(result);

  const a = document.createElement("a");
  a.setAttribute("download","Clientes.xlsx");
  a.href = url;
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}

async function getCategorias() {
  try{
    const response = await instance.get(`/opcionesMenu/categoriaMenu/categoriaCliente`);
    return response.data;
  }catch(error){
    console.error(error);
    return [];
  }
}

async function getPrecios(){
  try{
    const response = await instance.get(`/opcionesMenu/categoriaMenu/categoriaPrecio`);
    return response.data;
  }catch(error){
    console.error(error);
    return [];
  }
}

const findClientIndex = (idCliente) =>
  clientes.findIndex((cliente) => cliente.id === idCliente);

function filtrarClientes(cliente, str) {
  const clienteJoin = Object.values(cliente).join("");
  return clienteJoin.includes(str);
}

const createTable = (table, config) => $(table).DataTable(config);

function reloadTable(table, data) {
  table.clear().draw();
  table.rows.add(data).draw();
  loadButtons();
}

function loadButtons() {
  const btnEditar = document.querySelectorAll(".btn-editar");
  btnEditar.forEach((btn) => btn.addEventListener("click", onClickEdit));
  
  const btnBorrar = document.querySelectorAll(".btn-eliminar");
  btnBorrar.forEach((btn) => btn.addEventListener("click",onClickDelete));
}

function onClickEdit(e) {
  const cliente = clientes[findClientIndex(e.target.id)];
  llenarForm(formCliente, cliente);
  $(modal).modal({
    show: true,
    backdrop: "static",
  });
  e.stopImmediatePropagation();
}

function onClickDelete(e){
  const cliente = clientes[findClientIndex(e.target.id)];
  const desicion = confirm("¿Deseas borrar el cliente?");
  if(desicion){
    deleteCliente(cliente.id);
  }
  e.stopImmediatePropagation();
}

function onKeyUp(e){
  const value = e.target.value;
}

function onSubmit(e){
  e.preventDefault();
  const form = e.target;
  const id = form.elements["Id"].value;
  
  if(id === undefined || id === ""){
    addCliente(new FormData(form));
  }else{
    editClient(id,new FormData(form));
  }
}

function selectRow(e) {
  const rows = [
    ...e.path.find((r) => r.nodeName === "TBODY".toUpperCase()).children,
  ];
  rows.forEach((row) => removeClass(row, "row-selected"));

  const row = e.path.find((r) => r.nodeName === "tr".toUpperCase());
  const cliente = clientes[findClientIndex(row.id)];

  if (currentSelectClient !== undefined && currentSelectClient !== cliente) {
    // row.classList.add("row-selected");
    addClass(row, "row-selected");
    llenarForm(currentClietnForm, cliente);
    currentSelectClient = cliente;
    onClickedRow = true;
  } else {
    if (onClickedRow) {
      resetForm(currentClietnForm);
      onClickedRow = false;
    } else {
      addClass(row, "row-selected");
      llenarForm(currentClietnForm, cliente);
      currentSelectClient = cliente;
      onClickedRow = true;
    }
  }
}

const createOption = (value,text) => {
  const op = document.createElement("option");
  op.value = value;
  op.innerText = text;
  return op;
}

function removeClass(node, className) {
  if (node.classList.contains(className)) node.classList.remove(className);
}

function addClass(node, className) {
  if (!node.classList.contains(className)) node.classList.add(className);
}

const transformarInformacion = (data) =>
  data.map(
    (entity) =>
      new InformacionTabla(entity.id, entity.representante, entity.razonSocial)
  );

// llenar formularios
function llenarForm(idForm, entity) {
  const inputs = {
    value: ["text", "number", "select-one", "date"],
    check: ["checkbox"],
  };
  const fomInputs = [...document.getElementById(idForm).elements];
  const keys = Object.keys(entity);

  fomInputs.forEach((input) => {
    if (inputs.value.includes(input.type)) {
      const key = keys.find(
        (k) => k.toUpperCase() === input.name.toUpperCase()
      );
      input.value = entity[key] || "";
    }
    if (inputs.check.includes(input.type)) {
      const key = keys.find(
        (k) => k.toUpperCase() === input.name.toUpperCase()
      );
      input.checked = entity[key] || false;
    }
  });
}

function resetForm(form) {
  document.getElementById(form).reset();
}

class HttpClient {

  static post(url, data) {
    const result = fetch(url, {
      method: "post",
      body: data,
    }).then(async res => {
      if(res.ok){
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          return await res.json();
        } else {
          console.log("Oops, we haven't got JSON!");
        }
      }else {
        throw "Error";
      }
      
    })
    .catch(err => console.log(err));

    return result;
  }

  static put(url, data) {
    return fetch(url, {
      method: "put",
      body: data,
    }).then(async res => {
      if(res.ok){
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return await res.json();
      } else {
        console.log("Oops, we haven't got JSON!");
      }
      }else{
        throw "Error";
      }
    })
    .catch(err => console.log(err));;
  }

  static delete(url) {
    return fetch(url, {
      method: "delete",
    });
  }
}

class InformacionTabla {
  constructor(id, representante, razonSocial) {
    this.id = id;
    this.representante = representante;
    this.razonSocial = razonSocial;
    this.acciones = `
      <button class="btn btn-sm btn-primary btn-editar" id="${id}">
        Editar
      </button>
      <button class="btn btn-sm btn-danger btn-eliminar" id="${id}">
        Eliminar
      </button>
    `;
  }
}

class OptionMenu {
  constructor(value,text){
    this.value = value;
    this.text = text;
  }
}


