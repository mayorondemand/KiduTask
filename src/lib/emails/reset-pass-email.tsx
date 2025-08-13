import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
  } from "@react-email/components"
  
  interface ResetPassEmailProps {
    name: string
    loginLink: string
  }
  
  export default function ResetPassEmail({ name, loginLink }: ResetPassEmailProps) {
    return (
      <Html>
        <Head />
        <Preview>Your KudiTask password has been reset successfully</Preview>
        <Body style={main}>
          <Container style={container}>
            <Section style={logoContainer}>
              <Img
                src="/placeholder.svg?height=40&width=120&text=KudiTask"
                width="120"
                height="40"
                alt="KudiTask"
                style={logo}
              />
            </Section>
            <Heading style={h1}>Password Reset Successful</Heading>
            <Text style={heroText}>Hi {name}, your password has been successfully reset for your KudiTask account.</Text>
            <Text style={text}>
              You can now log in to your account using your new password. If you didn't make this change, please contact
              our support team immediately.
            </Text>
            <Section style={buttonContainer}>
              <Button style={button} href={loginLink}>
                Log In to Your Account
              </Button>
            </Section>
            <Text style={text}>
              For your security, we recommend:
              <br />• Using a strong, unique password
              <br />• Enabling two-factor authentication
              <br />• Keeping your account information up to date
            </Text>
            <Text style={text}>
              If the button above doesn't work, you can also copy and paste the following link into your browser:
            </Text>
            <Link href={loginLink} style={link}>
              {loginLink}
            </Link>
            <Section style={footerContainer}>
              <Text style={footerText}>
                Best regards,
                <br />
                The KudiTask Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    )
  }
  
  const main = {
    backgroundColor: "#f6f9fc",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  }
  
  const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
  }
  
  const logoContainer = {
    margin: "32px 0",
    textAlign: "center" as const,
  }
  
  const logo = {
    margin: "0 auto",
  }
  
  const h1 = {
    color: "#333",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    fontSize: "24px",
    fontWeight: "bold",
    margin: "40px 0",
    padding: "0",
    textAlign: "center" as const,
  }
  
  const heroText = {
    color: "#333",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    fontSize: "16px",
    lineHeight: "26px",
    textAlign: "center" as const,
  }
  
  const text = {
    color: "#333",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    fontSize: "14px",
    lineHeight: "24px",
    margin: "16px 0",
  }
  
  const buttonContainer = {
    padding: "27px 0 27px",
    textAlign: "center" as const,
  }
  
  const button = {
    backgroundColor: "#5469d4",
    borderRadius: "4px",
    color: "#fff",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    fontSize: "15px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "210px",
    padding: "14px 7px",
  }
  
  const link = {
    color: "#5469d4",
    textDecoration: "underline",
  }
  
  const footerContainer = {
    margin: "45px 0 0 0",
  }
  
  const footerText = {
    color: "#898989",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    fontSize: "12px",
    lineHeight: "22px",
    margin: "0",
    textAlign: "center" as const,
  }
  