import { Shield, Award, Truck, MessageCircle, RefreshCw, Tag } from 'lucide-react';

const features = [
  {
    title: 'Hàng chính hãng 100%',
    description: 'Cam kết tất cả sản phẩm đều là hàng chính hãng, nhập khẩu trực tiếp từ nhà sản xuất.',
    icon: Shield,
  },
  {
    title: 'Bảo hành chính hãng',
    description: 'Chế độ bảo hành theo chính sách của nhà sản xuất, hỗ trợ nhanh chóng.',
    icon: Award,
  },
  {
    title: 'Ship toàn quốc',
    description: 'Giao hàng nhanh chóng trên toàn quốc, miễn phí ship cho đơn hàng từ 500K.',
    icon: Truck,
  },
  {
    title: 'Tư vấn chuyên nghiệp',
    description: 'Đội ngũ tư vấn am hiểu pickleball, giúp bạn chọn sản phẩm phù hợp nhất.',
    icon: MessageCircle,
  },
  {
    title: 'Đổi trả dễ dàng',
    description: 'Chính sách đổi trả linh hoạt trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất.',
    icon: RefreshCw,
  },
  {
    title: 'Giá tốt nhất',
    description: 'Cam kết giá cạnh tranh nhất thị trường, hoàn tiền chênh lệch nếu tìm thấy rẻ hơn.',
    icon: Tag,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-10 text-foreground">
          Tại sao chọn YeuPick?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Icon size={24} className="text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1 text-foreground">{feature.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
