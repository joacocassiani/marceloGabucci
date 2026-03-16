// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCbxqW5ynVQ8JllUa5g_g9_txda6ohN1EA",
  authDomain: "marcelogabucci-75590.firebaseapp.com",
  projectId: "marcelogabucci-75590",
  storageBucket: "marcelogabucci-75590.firebasestorage.app",
  messagingSenderId: "115728896207",
  appId: "1:115728896207:web:82b9d84f819ce3bf3267ba",
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const startDateInput = document.getElementById("startDate");
  const endDateInput = document.getElementById("endDate");
  const generateButton = document.getElementById("generateTable");
  const exportButton = document.getElementById("exportExcel");
  const paymentTableBody = document.getElementById("paymentTable").querySelector("tbody");

  // Filtrar datos por rango de fechas y calcular montos por cuota
  const filterPaymentsByDate = async (startDate, endDate) => {
    const salesCollection = collection(db, "sales");
    const salesSnapshot = await getDocs(salesCollection);
    const sales = salesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const filteredPayments = [];

    sales.forEach((sale) => {
      const startDateSale = new Date(sale.saleDate);
      const paymentAmount = Math.floor((sale.total) / sale.payments);

      for (let i = 0; i < sale.payments; i++) {
        const paymentDate = new Date(startDateSale);

        if (sale.periodicity === "Semanal") {
          paymentDate.setDate(startDateSale.getDate() + i * 7);
        } else if (sale.periodicity === "Quincenal") {
          paymentDate.setDate(startDateSale.getDate() + i * 15);
        } else if (sale.periodicity === "Mensual") {
          paymentDate.setMonth(startDateSale.getMonth() + i);
        }

        if (paymentDate >= new Date(startDate) && paymentDate <= new Date(endDate)) {
          filteredPayments.push({
            name: sale.clientName,
            amount: paymentAmount.toFixed(2),
            installment: `Cuota ${i + 1}`,
            date: paymentDate.toISOString().split("T")[0],
            currency: sale.currency || "ARS",
          });
        }
      }
    });

    return filteredPayments;
  };

  // Renderizar tabla
  const renderTable = (filteredPayments) => {
    paymentTableBody.innerHTML = ""; // Limpiar la tabla

    if (filteredPayments.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="5">No se encontraron resultados</td>`;
      paymentTableBody.appendChild(row);
      return;
    }

    // Insertar cada pago como fila
    filteredPayments.forEach((payment) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${payment.name}</td>
        <td>$${Number(payment.amount).toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}</td>
        <td>${payment.installment}</td>
        <td>${payment.date}</td>
        <td>${payment.currency}</td>
      `;
      paymentTableBody.appendChild(row);
    });

    // Calcular total
    const totalAmount = filteredPayments.reduce((acc, curr) => {
      return acc + parseFloat(curr.amount);
    }, 0);

    // Agregar fila de total al final
    const totalRow = document.createElement("tr");
    totalRow.innerHTML = `
      <td><strong>TOTAL</strong></td>
      <td><strong>$${Math.round(totalAmount).toLocaleString("es-AR")}</strong></td>
      <td></td>
      <td></td>
      <td></td>
    `;
    paymentTableBody.appendChild(totalRow);
  };

  // Exportar tabla a Excel
  const exportToExcel = async () => {

    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    // Formatear fechas a DD-MM-YYYY
    const formatDate = (isoDate) => {
      const [year, month, day] = isoDate.split("-");
      return `${day}-${month}-${year}`;
    };

    const fileName = `Cobranza_${formatDate(startDate)}_a_${formatDate(endDate)}.xlsx`;

    // Obtener los datos filtrados con valores numéricos reales (sin formato de texto)
    // Esto evita que SheetJS interprete el punto de miles de toLocaleString("es-AR") como decimal
    const filteredPayments = await filterPaymentsByDate(startDate, endDate);

    const excelData = [
      ["Nombre", "Monto", "Cuota", "Fecha", "Moneda"]
    ];

    filteredPayments.forEach((payment) => {
      excelData.push([
        payment.name,
        parseFloat(payment.amount), // número puro, sin formatear
        payment.installment,
        payment.date,
        payment.currency,
      ]);
    });

    const totalAmount = filteredPayments.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    excelData.push(["TOTAL", Math.round(totalAmount), "", "", ""]);

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);

    // Aplicar formato numérico con separador de miles en la columna Monto (columna B)
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let row = 1; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: 1 });
      if (worksheet[cellAddress] && typeof worksheet[cellAddress].v === "number") {
        worksheet[cellAddress].t = "n";
        worksheet[cellAddress].z = "#,##0";
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cobranza");
    XLSX.writeFile(workbook, fileName);
  };

  // Evento para generar la tabla
  generateButton.addEventListener("click", async () => {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;

    if (!startDate || !endDate) {
      alert("Por favor, selecciona un rango de fechas válido.");
      return;
    }

    const filteredPayments = await filterPaymentsByDate(startDate, endDate);
    renderTable(filteredPayments);
  });

  // Evento para exportar a Excel
  exportButton.addEventListener("click", exportToExcel);
});
