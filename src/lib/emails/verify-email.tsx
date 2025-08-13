import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Html,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

interface VerificationEmailProps {
	name: string;
	verificationLink: string;
}

export default function VerificationEmail({
	name,
	verificationLink,
}: VerificationEmailProps) {
	return (
		<Html>
			<Head />
			<Preview>Verify your KudiTask account</Preview>
			<Body style={main}>
				<Container style={container}>
					<Section style={logoContainer}>
						<Heading style={logo}>KudiTask</Heading>
					</Section>

					<Section style={content}>
						<Heading style={h1}>Welcome to KudiTask!</Heading>

						<Text style={text}>Hi {name},</Text>

						<Text style={text}>
							Thank you for signing up for KudiTask! We're excited to have you
							join our community of task performers and advertisers.
						</Text>

						<Text style={text}>
							To get started, please verify your email address by clicking the
							button below:
						</Text>

						<Section style={buttonContainer}>
							<Button style={button} href={verificationLink}>
								Verify Email Address
							</Button>
						</Section>

						<Text style={text}>
							If the button above doesn't work, you can also copy and paste the
							following link into your browser:
						</Text>

						<Text style={linkText}>
							<Link href={verificationLink} style={link}>
								{verificationLink}
							</Link>
						</Text>

						<Text style={text}>
							This verification link will expire in 24 hours for security
							reasons.
						</Text>

						<Text style={text}>
							If you didn't create an account with KudiTask, you can safely
							ignore this email.
						</Text>

						<Text style={text}>
							Best regards,
							<br />
							The KudiTask Team
						</Text>
					</Section>

					<Section style={footer}>
						<Text style={footerText}>
							© 2024 KudiTask. All rights reserved.
						</Text>
						<Text style={footerText}>
							This email was sent to verify your account. If you have any
							questions, please contact our support team.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	marginBottom: "64px",
};

const logoContainer = {
	padding: "32px 20px",
	textAlign: "center" as const,
	borderBottom: "1px solid #f0f0f0",
};

const logo = {
	color: "#1f2937",
	fontSize: "32px",
	fontWeight: "bold",
	margin: "0",
};

const content = {
	padding: "32px 20px",
};

const h1 = {
	color: "#1f2937",
	fontSize: "24px",
	fontWeight: "bold",
	margin: "0 0 20px",
	textAlign: "center" as const,
};

const text = {
	color: "#374151",
	fontSize: "16px",
	lineHeight: "24px",
	margin: "0 0 16px",
};

const buttonContainer = {
	textAlign: "center" as const,
	margin: "32px 0",
};

const button = {
	backgroundColor: "#3b82f6",
	borderRadius: "8px",
	color: "#ffffff",
	fontSize: "16px",
	fontWeight: "bold",
	textDecoration: "none",
	textAlign: "center" as const,
	display: "inline-block",
	padding: "12px 32px",
	border: "none",
	cursor: "pointer",
};

const linkText = {
	color: "#374151",
	fontSize: "14px",
	lineHeight: "20px",
	margin: "0 0 16px",
	wordBreak: "break-all" as const,
};

const link = {
	color: "#3b82f6",
	textDecoration: "underline",
};

const footer = {
	borderTop: "1px solid #f0f0f0",
	padding: "32px 20px 0",
	textAlign: "center" as const,
};

const footerText = {
	color: "#6b7280",
	fontSize: "12px",
	lineHeight: "16px",
	margin: "0 0 8px",
};
