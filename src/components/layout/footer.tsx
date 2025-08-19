import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="font-bold text-xl text-gray-900 mb-4">
              Kuditask
            </div>
            <p className="text-gray-600 text-sm">
              The all-in-one UGC creator marketplace for modern brands.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Creators
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Brands
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-gray-900">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          © {new Date().getFullYear()} Kuditask. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
