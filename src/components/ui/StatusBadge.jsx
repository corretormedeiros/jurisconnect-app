import React from 'react'

const StatusBadge = ({ status, type = 'demand' }) => {
  const getStatusConfig = () => {
    if (type === 'demand') {
      switch (status) {
        case 'Pendente':
          return { className: 'status-badge status-pending', text: 'Pendente' }
        case 'Em Andamento':
          return { className: 'status-badge status-in-progress', text: 'Em Andamento' }
        case 'Cumprida':
          return { className: 'status-badge status-completed', text: 'Cumprida' }
        case 'Cancelada':
          return { className: 'status-badge status-cancelled', text: 'Cancelada' }
        default:
          return { className: 'status-badge bg-gray-100 text-gray-800', text: status }
      }
    }

    if (type === 'approval') {
      switch (status) {
        case 'PENDENTE':
          return { className: 'status-badge status-pending', text: 'Pendente' }
        case 'APROVADO':
          return { className: 'status-badge status-approved', text: 'Aprovado' }
        case 'REPROVADO':
          return { className: 'status-badge status-rejected', text: 'Reprovado' }
        default:
          return { className: 'status-badge bg-gray-100 text-gray-800', text: status }
      }
    }

    if (type === 'financial') {
      switch (status) {
        case 'PAGO':
          return { className: 'status-badge status-completed', text: 'Pago' }
        case 'A_PAGAR':
          return { className: 'status-badge status-pending', text: 'A Pagar' }
        case 'RECEBIDO':
          return { className: 'status-badge status-completed', text: 'Recebido' }
        case 'A_RECEBER':
          return { className: 'status-badge status-pending', text: 'A Receber' }
        default:
          return { className: 'status-badge bg-gray-100 text-gray-800', text: status }
      }
    }

    return { className: 'status-badge bg-gray-100 text-gray-800', text: status }
  }

  const config = getStatusConfig()

  return (
    <span className={config.className}>
      {config.text}
    </span>
  )
}

export default StatusBadge