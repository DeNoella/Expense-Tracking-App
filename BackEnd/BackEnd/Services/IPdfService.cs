using BackEnd.Entities;

namespace BackEnd.Services
{
    public interface IPdfService
    {
        byte[] GenerateInvoice(Order order);
    }
}

