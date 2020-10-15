

const apiUrl = "http://l.iqtics.mx/api";


class ProveedorTabla {
  constructor(id, represenante, razonSocial) {
    this.id = id;
    this.representante = represenante;
    this.razonSocial = razonSocial;
    this.acciones = `
            <button class="btn btn-info btn-sm btn-editar" type="button" data-toggle="modal" data-client-id="${id}" data-backdrop="static" data-keyboard="false" data-target="#EditarCliente">
                <i class="fas fa-user-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm btn-eliminar" type="submit"  data-client-id="${id}">
                <i class="fas fa-user-times"></i>
            </button>
        `;
  }
}

class ProveedorFiltro {
  constructor(
    id,
    claveRegistro,
    representante,
    telefono,
    celular,
    email,
    ciudad,
    razonSocial,
    rfc,
    telefonoEmpresa,
    celularEmpresa,
    ciudadEmpresa,
    paqueteria
  ) {
    this.id = id;
    this.claveRegistro = claveRegistro;
    this.representante = representante;
    this.telfono = telefono;
    this.celular = celular;
    this.email = email;
    this.ciudad = ciudad;
    this.razonSocial = razonSocial;
    this.rfc = rfc;
    this.telefonoEmpresa = telefonoEmpresa;
    this.celularEmpresa = celularEmpresa;
    this.ciudadEmpresa = ciudadEmpresa;
    this.paqueteria = paqueteria;
  }
}

let proveedores = [];
let proveedoresFilter = [];
let proveedorSeleccionado = {};

(() => {
  document.addEventListener("DOMContentLoaded", async () => {
    let formFiltros = document.querySelector("#form-filtros");
    let formMostrarCliente = document.querySelector("#mostrar-proveedor");
    let inputsFechaAlta = document.querySelectorAll(".input-fecha-alta");
    proveedores = await GetProveedores();
    let tabla = CrearTabla(TransoformarInformacion(proveedores));
    formFiltros.addEventListener("keyup", () => {
      let filtro = formFiltros.value;
      proveedoresFilter = proveedores.filter((c) =>
        FiltrarProveedores(c, filtro)
      );
      RecargarTabla(tabla, TransoformarInformacion(proveedoresFilter));
    });
    document
      .getElementById("add-proveedor")
      .addEventListener("submit", onSubmitAddForm);
    document
      .getElementById("edit-proveedor")
      .addEventListener("submit", onSubmitEditForm);
    document.getElementById("btn-export").addEventListener("click", exportXls);
  });
})();

function onSubmitAddForm(e) {
  const form = e.target;
  PostProveedor(new FormData(form));
  reload();
}

function onSubmitEditForm(e) {
  const form = e.target;
  PutProveedor(new FormData(form));
  reload();
}

async function exportXls(e) {
  const result = await HttpClient.get(`${apiUrl}/proveedores/export`);
  console.log(result);
  const url = window.URL.createObjectURL(result);

  const a = document.createElement("a");
  a.setAttribute("download", "Clientes.xlsx");
  a.href = url;
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}

async function PostProveedor(proveedor) {
  const result = await HttpClient.post(`${apiUrl}/proveedores`, proveedor);
  console.log(result);
}

async function PutProveedor(proveedor) {
  const result = await HttpClient.put(
    `${apiUrl}/proveedores/` + proveedorSeleccionado.id,
    proveedor
  );
  console.log(result);
}

async function GetProveedores() {
  const result = await HttpClient.get(`${apiUrl}/proveedores`);
  return result;
}

function FindProveedoresOfIdx(id) {
  let idx = proveedores.findIndex((proveedor) => proveedor.id === id);
  return idx;
}

async function EliminarProveedor(IdCliente) {
  let data = IdCliente;
  const result = await HttpClient.delete(`${apiUrl}/proveedores/` + data);
  let clienteDeleted = await result.json();
  proveedores.splice(FindProveedoresOfIdx(clienteDeleted.id), 1);
}

function SeleccionarProveedor(idProveedor) {
  let cliente = proveedores[FindProveedoresOfIdx(idProveedor)];
  llenarForm("#mostrar-proveedor", cliente);
}

function CrearTabla(data) {
  let tabla = $("#tabla").DataTable({
    searching: false,
    paging: false,
    bInfo: false,
    bScrollInfinite: true,
    bScrollCollapse: true,
    ordering: false,
    sScrollY: "170px",
    columnDefs: [{ width: "10%", targets: 2 }],
    createdRow: function (row, data, dataIndex) {
      $(row).attr("id", data.id);
    },
    columns: [
      { data: "representante" },
      { data: "razonSocial" },
      { data: "acciones" },
    ],
    data: data,
  });

  SelectFila(tabla);
  CargarBotones(tabla);
  return tabla;
}

function SelectFila(tabla) {
  let filas = [...document.querySelectorAll("#tabla tbody tr")];

  filas.forEach((tr) => {
    tr.addEventListener("click", () => {
      if (tr.classList.contains("selected")) {
        tr.classList.remove("selected");
        tr.style.backgroundColor = "";
        tr.style.color = "";
        document.getElementById("mostrar-proveedor").reset();
      } else {
        tabla.$("tr.selected").removeClass("selected");
        tr.classList.add("selected");
        for (var i = 0; i < filas.length; i++) {
          filas[i].style.backgroundColor = "";
          filas[i].style.color = "";
        }
        tr.style.backgroundColor = "#1560ff";
        tr.style.color = "#fff";
        SeleccionarProveedor(tr.id);
      }
    });
  });
}

function TransoformarInformacion(data) {
  let dataResult = [];
  data.forEach((proveedor) =>
    dataResult.push(
      new ProveedorTabla(
        proveedor.id,
        proveedor.representante,
        proveedor.razonSocial
      )
    )
  );
  return dataResult;
}

function FiltrarProveedores(proveedor, str) {
  let datosProveedor = Object.values(proveedor).join("");
  return datosProveedor.includes(str);
}

function reload() {
  window.location.reload();
}

async function CargarBotones(tabla) {
  let btnElimniar = document.querySelectorAll(".btn-eliminar");
  let btnEditar = document.querySelectorAll(".btn-editar");

  btnElimniar.forEach((btn) => {
    let idCliente = btn.dataset.clientId;
    btn.addEventListener("click", () => {
      const confirmacion = confirm("¿Desea borrar el proveedor?");
      if (confirmacion) {
        EliminarProveedor(idCliente);
        reload();
      }
    });
  });
  btnEditar.forEach((btn) => {
    btn.addEventListener("click", () => {
      let id = FindProveedoresOfIdx(btn.dataset.clientId);
      console.log(id);
      proveedorSeleccionado = proveedores[id];
      console.log(proveedorSeleccionado);
      console.log(proveedorSeleccionado.id);
      llenarForm("#edit-proveedor", proveedorSeleccionado);
    });
  });
}

function llenarForm(idForm, entity) {
  const inputs = {
    value: ["text", "number", "select", "date"],
    check: ["checkbox"],
  };

  const fomInputs = [...document.querySelector(idForm).elements];
  
  if(entity !== undefined){
    const keys = Object.keys(entity);

    fomInputs.forEach((input) => {
      if (inputs.value.includes(input.type)) {
        const key = keys.find(
          (k) => k.toUpperCase() === input.name.toUpperCase()
        );
        input.value = entity[key];
      }
      if (inputs.check.includes(input.type)) {
        const key = keys.find(
          (k) => k.toUpperCase() === input.name.toUpperCase()
        );
        input.checked = entity[key];
      }
    });
  }
  
}

class HttpClient {
  static async get(url) {
    const result = await fetch(url)
      .then(async (res) => {
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return await res.json();
          } else if (
            contentType &&
            contentType.indexOf(
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ) !== -1
          ) {
            return await res.blob();
          } else {
            console.log("Oops, we haven't got JSON!");
          }
        } else {
          throw "Error";
        }
      })
      .catch((error) => console.log(error));

    return result;
  }

  static post(url, data) {
    const result = fetch(url, {
      method: "post",
      body: data,
    })
      .then(async (res) => {
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return await res.json();
          } else {
            console.log("Oops, we haven't got JSON!");
          }
        } else {
          throw "Error";
        }
      })
      .catch((err) => console.log(err));

    return result;
  }

  static put(url, data) {
    return fetch(url, {
      method: "put",
      body: data,
    })
      .then(async (res) => {
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            return await res.json();
          } else {
            console.log("Oops, we haven't got JSON!");
          }
        } else {
          throw "Error";
        }
      })
      .catch((err) => console.log(err));
  }

  static delete(url) {
    return fetch(url, {
      method: "delete",
    });
  }
}
