const MESSAGE = "배달/택배 기사님들의 빠른 배송을 응원합니다"

export function FooterCheerMarquee() {
  return (
    <div className="footer-cheer-mask flex h-8 w-full items-center overflow-hidden md:h-9">
      <div className="footer-cheer-track will-change-transform">
        <span className="footer-cheer-item">{MESSAGE}</span>
        <span className="footer-cheer-item" aria-hidden="true">
          {MESSAGE}
        </span>
      </div>
    </div>
  )
}
