const MESSAGE = "배달/택배 기사님들의 빠른 배송을 응원합니다"

export function FooterCheerMarquee() {
  return (
    <div className="footer-cheer-mask relative mx-auto max-w-full overflow-hidden py-0.5">
      <div className="footer-cheer-track will-change-transform">
        <span className="footer-cheer-text shrink-0 whitespace-nowrap px-8 text-xs font-medium">
          {MESSAGE}
        </span>
        <span className="footer-cheer-text shrink-0 whitespace-nowrap px-8 text-xs font-medium">
          {MESSAGE}
        </span>
      </div>
    </div>
  )
}
