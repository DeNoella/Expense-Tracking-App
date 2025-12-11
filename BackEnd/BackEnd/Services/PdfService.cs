using BackEnd.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace BackEnd.Services
{
    public class PdfService : IPdfService
    {
        public byte[] GenerateInvoice(Order order)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Header().Text($"Invoice #{order.Id}").FontSize(18).SemiBold();

                    page.Content().Column(col =>
                    {
                        col.Item().Text($"Customer: {order.User.Email}");
                        col.Item().Text($"Date: {order.CreatedAt:yyyy-MM-dd HH:mm} UTC");
                        col.Item().Text($"Status: {order.Status}");
                        col.Item().LineHorizontal(1);

                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.ConstantColumn(30);
                                columns.RelativeColumn(4);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn(2);
                            });

                            table.Header(header =>
                            {
                                header.Cell().Text("#").SemiBold();
                                header.Cell().Text("Product").SemiBold();
                                header.Cell().Text("Qty").SemiBold();
                                header.Cell().Text("Line Total").SemiBold();
                            });

                            var index = 1;
                            foreach (var item in order.Items)
                            {
                                table.Cell().Text(index.ToString());
                                table.Cell().Text(item.Product.Name);
                                table.Cell().Text(item.Quantity.ToString());
                                table.Cell().Text(item.LineTotal.ToString("C"));
                                index++;
                            }
                        });

                        col.Item().AlignRight().Text($"Total: {order.Total:C}").FontSize(14).SemiBold();
                    });

                    page.Footer().AlignCenter().Text("BuyPoint - Thank you for your purchase");
                });
            });

            return document.GeneratePdf();
        }
    }
}

